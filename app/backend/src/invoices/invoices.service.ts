import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from './invoice.entity';
import { DailyClosing } from './daily-closing.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { FiscalService } from '../fiscal/fiscal.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(DailyClosing)
        private dailyClosingRepository: Repository<DailyClosing>,
        private fiscalService: FiscalService,
        private auditLogsService: AuditLogsService,
    ) { }

    async findAll(companyId: number): Promise<Invoice[]> {
        return this.invoiceRepository.find({
            where: { company: { id: companyId } },
            relations: ['company'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number, companyId: number): Promise<Invoice | null> {
        return await this.invoiceRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['company', 'items']
        });
    }

    /**
     * CRITICAL: CREACIÓN DE REGISTRO FISCAL INMUTABLE
     * Implementa: Encadenamiento Hash + Numeración Correlativa + No Alterabilidad
     */
    async create(createInvoiceDto: CreateInvoiceDto, companyId: number, user: any): Promise<Invoice> {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) throw new Error('Empresa no encontrada para facturación.');

        const series = createInvoiceDto.series || 'A';
        const terminalId = createInvoiceDto.terminalId || 'T01';

        // 1. CONTROL DE NUMERACIÓN FISCAL (Correlativa estricta)
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId }, series },
            order: { invoiceNumber: 'DESC' }
        });

        let nextNum = lastInvoice ? (parseInt(lastInvoice.invoiceNumber.replace(/\D/g, '')) || 0) + 1 : 1;

        // Safety: If nextNum looks like a timestamp (e.g. > 1,000,000,000), 
        // it's corrupted data. Revert by counting actual invoices.
        if (nextNum > 1000000000) {
            const actualCount = await this.invoiceRepository.count({
                where: { company: { id: companyId }, series }
            });
            nextNum = actualCount + 1;
        }

        const formattedNumber = nextNum.toString().padStart(6, '0');

        // 2. ENCADENAMIENTO DE REGISTROS (Hash Chain)
        // Usamos una versión parcial de la factura para calcular el hash antes de guardarla
        const taxableBase = createInvoiceDto.taxableBase ?? (createInvoiceDto.amount / 1.1);
        const vatRate = createInvoiceDto.vatRate ?? 10;
        const vatAmount = createInvoiceDto.vatAmount ?? (createInvoiceDto.amount - taxableBase);

        const tempInvoice: Partial<Invoice> = {
            invoiceNumber: formattedNumber,
            series: series,
            amount: Number(createInvoiceDto.amount),
            taxableBase: Number(taxableBase),
            vatAmount: Number(vatAmount),
            vatRate: Number(vatRate),
            createdAt: new Date(),
            company: company
        };

        const { hash, previousHash } = await this.fiscalService.calculateChainedHash(tempInvoice, companyId);

        // 3. PERSISTENCIA INMUTABLE
        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            taxableBase,
            vatAmount,
            vatRate,
            invoiceNumber: formattedNumber,
            series,
            terminalId,
            company,
            hash,
            previousHash,
            fiscalStatus: 'normal',
            aeatSent: false,
            client: createInvoiceDto.clientId ? { id: createInvoiceDto.clientId } : undefined,
            items: createInvoiceDto.items?.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            }))
        });

        const savedInvoice = await this.invoiceRepository.save(invoice);

        // 4. AUDITORÍA (LOG INMUTABLE)
        await this.auditLogsService.log(
            { id: user.userId || user.id } as User,
            company,
            'FISCAL_RECORD_CREATED',
            {
                invoiceId: savedInvoice.id,
                invoiceNumber: `${series}-${formattedNumber}`,
                hash: savedInvoice.hash
            },
            `Registro fiscal generado y encadenado correctamente.`
        );

        // Sync Company helper if needed
        if (!isNaN(nextNum)) {
            await this.companyRepository.update(companyId, { nextInvoiceNumber: nextNum + 1 });
        }

        return savedInvoice;
    }

    /**
     * LEY ANTIFRAUDE: PROHIBIDO MODIFICAR DATOS FISCALES
     */
    async update(id: number, updateInvoiceDto: UpdateInvoiceDto, companyId: number): Promise<Invoice | null> {
        const invoice = await this.findOne(id, companyId);
        if (!invoice) return null;

        // Si se intenta cambiar importe o campos críticos, bloqueamos.
        const criticalFields = ['amount', 'taxableBase', 'vatAmount', 'vatRate', 'invoiceNumber', 'series'];
        for (const field of criticalFields) {
            if (updateInvoiceDto[field] !== undefined && updateInvoiceDto[field] !== invoice[field]) {
                throw new Error(`VIOLACIÓN LEY 11/2021: El campo ${field} es inmutable tras la emisión del registro fiscal.`);
            }
        }

        if (Object.keys(updateInvoiceDto).length > 0) {
            await this.invoiceRepository.update(id, updateInvoiceDto);
        }
        return this.findOne(id, companyId);
    }

    /**
     * LEY ANTIFRAUDE: PROHIBIDO BORRAR REGISTROS FISCALES
     */
    async remove(id: number, companyId: number): Promise<void> {
        throw new Error('VIOLACIÓN LEY 11/2021: La eliminación física de registros de facturación está prohibida. Use facturas rectificativas para anular operaciones.');
    }

    // --- Daily Closing Methods (Z-Reports) ---

    async getClosingStats(companyId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                createdAt: Between(today, tomorrow),
                type: 'sale'
            }
        });

        return {
            totalAmount: invoices.reduce((s, i) => s + i.amount, 0),
            totalSalesCount: invoices.length,
            cashTotal: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + i.amount, 0),
            cardTotal: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + i.amount, 0),
            topProducts: [], // To be implemented with InvoiceItems
            lowStockItems: []
        };
    }

    async performDailyClosing(companyId: number, user: any, actualCash: number): Promise<DailyClosing> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                createdAt: Between(today, tomorrow),
                type: 'sale'
            },
            order: { createdAt: 'ASC' }
        });

        if (invoices.length === 0) throw new Error('No hay ventas registradas para hoy.');

        const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalVat = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);

        const lastClosing = await this.dailyClosingRepository.findOne({
            where: { company: { id: companyId } },
            order: { closingNumber: 'DESC' }
        });
        const nextClosingNumber = lastClosing ? lastClosing.closingNumber + 1 : 1;

        const closing = this.dailyClosingRepository.create({
            company: { id: companyId } as any,
            user,
            closingNumber: nextClosingNumber,
            firstInvoiceNumber: invoices[0].invoiceNumber,
            lastInvoiceNumber: invoices[invoices.length - 1].invoiceNumber,
            totalAmount,
            totalVat,
            expectedCash: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + i.amount, 0),
            actualCash,
            expectedCard: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + i.amount, 0),
            totalSalesCount: invoices.length,
            vatBreakdown: JSON.stringify({ '10%': totalVat }),
            itemizedSales: JSON.stringify([])
        });

        return await this.dailyClosingRepository.save(closing);
    }

    async getClosingHistory(companyId: number) {
        return await this.dailyClosingRepository.find({
            where: { company: { id: companyId } },
            relations: ['user'],
            order: { timestamp: 'DESC' }
        });
    }
}
