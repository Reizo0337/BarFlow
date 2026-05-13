import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
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
            where: { company: { id: companyId }, series: series },
            order: { invoiceNumber: 'DESC' }
        });

        // Ensure nextNum is never NaN
        let nextNum = company.nextInvoiceNumber || 1;
        if (lastInvoice) {
            const parsed = parseInt(lastInvoice.invoiceNumber);
            if (!isNaN(parsed)) {
                nextNum = Math.max(nextNum, parsed + 1);
            }
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
        try {
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
        } catch (error) {
            console.error('Error creating audit log:', error);
        }

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
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                closing: IsNull(),
                type: 'sale'
            },
            relations: ['items']
        });

        const itemizedMap: Record<string, { quantity: number, total: number }> = {};
        const vatMap: Record<string, number> = {};

        invoices.forEach(inv => {
            const rateKey = `${inv.vatRate}%`;
            vatMap[rateKey] = (vatMap[rateKey] || 0) + Number(inv.vatAmount);

            inv.items?.forEach(item => {
                if (!itemizedMap[item.productName]) itemizedMap[item.productName] = { quantity: 0, total: 0 };
                itemizedMap[item.productName].quantity += Number(item.quantity);
                itemizedMap[item.productName].total += Number(item.total);
            });
        });

        return {
            totalAmount: invoices.reduce((s, i) => s + Number(i.amount), 0),
            totalSalesCount: invoices.length,
            cashTotal: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + Number(i.amount), 0),
            cardTotal: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + Number(i.amount), 0),
            vatBreakdown: vatMap,
            topProducts: Object.entries(itemizedMap)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5),
            lowStockItems: []
        };
    }

    async performDailyClosing(companyId: number, user: any, actualCash: number): Promise<DailyClosing> {
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                closing: IsNull(),
                type: 'sale'
            },
            relations: ['items'],
            order: { createdAt: 'ASC' }
        });

        if (invoices.length === 0) throw new Error('No hay ventas pendientes de cierre en este momento.');

        // Detailed Calculation Logic
        const itemizedMap: Record<string, { quantity: number, total: number, vat: number }> = {};
        const vatMap: Record<string, { base: number, vat: number }> = {};
        let totalAmount = 0;
        let totalVat = 0;
        let expectedCash = 0;
        let expectedCard = 0;

        invoices.forEach(inv => {
            totalAmount += Number(inv.amount);
            totalVat += Number(inv.vatAmount);

            if (inv.paymentMethod === 'cash') expectedCash += Number(inv.amount);
            if (inv.paymentMethod === 'card') expectedCard += Number(inv.amount);

            // VAT Breakdown
            const rateKey = `${inv.vatRate}%`;
            if (!vatMap[rateKey]) vatMap[rateKey] = { base: 0, vat: 0 };
            vatMap[rateKey].base += Number(inv.taxableBase);
            vatMap[rateKey].vat += Number(inv.vatAmount);

            // Itemized Sales
            inv.items?.forEach(item => {
                if (!itemizedMap[item.productName]) {
                    itemizedMap[item.productName] = { quantity: 0, total: 0, vat: 0 };
                }
                itemizedMap[item.productName].quantity += Number(item.quantity);
                itemizedMap[item.productName].total += Number(item.total);
                // Approx VAT per item based on invoice rate
                const itemVat = item.total * (inv.vatRate / 100);
                itemizedMap[item.productName].vat += itemVat;
            });
        });

        const lastClosing = await this.dailyClosingRepository.findOne({
            where: { company: { id: companyId } },
            order: { closingNumber: 'DESC' }
        });
        const nextClosingNumber = lastClosing ? lastClosing.closingNumber + 1 : 1;
        const previousHash = lastClosing?.hash || '0'.repeat(64);
        
        // Simple hash for the closing itself
        const hash = require('crypto')
            .createHash('sha256')
            .update(`${companyId}-${nextClosingNumber}-${totalAmount}-${previousHash}`)
            .digest('hex');

        const closing = this.dailyClosingRepository.create({
            company: { id: companyId } as any,
            user: { id: user.userId || user.id } as User,
            closingNumber: nextClosingNumber,
            firstInvoiceNumber: invoices[0].invoiceNumber,
            lastInvoiceNumber: invoices[invoices.length - 1].invoiceNumber,
            terminalId: invoices[0].terminalId || 'T01',
            totalAmount,
            totalVat,
            expectedCash,
            actualCash,
            expectedCard,
            totalSalesCount: invoices.length,
            vatBreakdown: JSON.stringify(vatMap),
            itemizedSales: JSON.stringify(Object.entries(itemizedMap).map(([name, data]) => ({
                name,
                ...data
            }))),
            previousHash,
            hash
        });

        const savedClosing = await this.dailyClosingRepository.save(closing);

        // Mark all these invoices as closed
        if (invoices.length > 0) {
            await this.invoiceRepository.update(
                invoices.map(inv => inv.id),
                { closing: { id: savedClosing.id } } as any
            );
        }

        return savedClosing;
    }

    async getClosingHistory(companyId: number) {
        return await this.dailyClosingRepository.find({
            where: { company: { id: companyId } },
            relations: ['user'],
            order: { timestamp: 'DESC' }
        });
    }
}
