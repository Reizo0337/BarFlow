import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
    ) { }

    findAll(companyId: number): Promise<Invoice[]> {
        return this.invoiceRepository.find({
            where: { company: { id: companyId } },
            relations: ['company']
        });
    }

    findOne(id: number, companyId: number): Promise<Invoice | null> {
        return this.invoiceRepository.findOne({
            where: { id, company: { id: companyId } }
        });
    }

    create(createInvoiceDto: CreateInvoiceDto, companyId: number): Promise<Invoice> {
        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            company: { id: companyId } as any
        });
        return this.invoiceRepository.save(invoice);
    }

    async update(id: number, updateInvoiceDto: UpdateInvoiceDto, companyId: number): Promise<Invoice | null> {
        const invoice = await this.findOne(id, companyId);
        if (!invoice) return null;

        await this.invoiceRepository.update(id, updateInvoiceDto);
        return this.findOne(id, companyId);
    }

    async remove(id: number, companyId: number): Promise<void> {
        const invoice = await this.findOne(id, companyId);
        if (invoice) {
            await this.invoiceRepository.delete(id);
        }
    }
}
