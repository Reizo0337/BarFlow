import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { Company } from '../companies/company.entity';

import * as crypto from 'crypto';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) { }

    private calculateHash(data: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    findAll(companyId: number): Promise<Invoice[]> {
        return this.invoiceRepository.find({
            where: { company: { id: companyId } },
            relations: ['company'],
            order: { createdAt: 'DESC' }
        });
    }

    findOne(id: number, companyId: number): Promise<Invoice | null> {
        return this.invoiceRepository.findOne({
            where: { id, company: { id: companyId } }
        });
    }

    async create(createInvoiceDto: CreateInvoiceDto, companyId: number): Promise<Invoice> {
        // Get company to get current invoice number
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) throw new Error('Company not found');

        const currentNumber = company.nextInvoiceNumber;
        const formattedNumber = `FAC-${new Date().getFullYear()}-${currentNumber.toString().padStart(5, '0')}`;

        // 1. Find previous invoice for chaining
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId } },
            order: { createdAt: 'DESC' }
        });

        const previousHash = lastInvoice ? lastInvoice.hash : '0'.repeat(64);

        // 2. Calculate Hash
        const invoiceData = {
            invoiceNumber: formattedNumber,
            amount: createInvoiceDto.amount,
            clientName: createInvoiceDto.clientName,
            createdAt: new Date().toISOString(),
            previousHash,
            companyId
        };

        const hash = this.calculateHash(invoiceData);

        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            invoiceNumber: formattedNumber,
            company: { id: companyId } as any,
            previousHash,
            hash
        });

        const savedInvoice = await this.invoiceRepository.save(invoice);

        // Increment the number for next time
        await this.companyRepository.update(companyId, {
            nextInvoiceNumber: currentNumber + 1
        });

        return savedInvoice;
    }

    async update(id: number, updateInvoiceDto: UpdateInvoiceDto, companyId: number): Promise<Invoice | null> {
        // Law Compliance: Usually invoices shouldn't be updated. 
        // We only allow updating status to 'cancelled' if needed, but the hash remains.
        const invoice = await this.findOne(id, companyId);
        if (!invoice) return null;

        // If trying to change amount or other fiscal data, block it for Veri*factu
        if (updateInvoiceDto.amount && updateInvoiceDto.amount !== invoice.amount) {
            throw new Error('No se puede modificar el importe de una factura emitida por ley antifraude.');
        }

        await this.invoiceRepository.update(id, updateInvoiceDto);
        return this.findOne(id, companyId);
    }

    async remove(id: number, companyId: number): Promise<void> {
        const invoice = await this.findOne(id, companyId);
        if (invoice) {
            // Law Compliance: Block physical deletion
            throw new Error('La ley antifraude prohíbe la eliminación física de registros de facturación.');
        }
    }
}
