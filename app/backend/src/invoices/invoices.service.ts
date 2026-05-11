import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { Company } from '../companies/company.entity';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
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

    async create(createInvoiceDto: CreateInvoiceDto, companyId: number): Promise<Invoice> {
        // Get company to get current invoice number
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company) throw new Error('Company not found');

        const currentNumber = company.nextInvoiceNumber;
        const formattedNumber = `FAC-${new Date().getFullYear()}-${currentNumber.toString().padStart(5, '0')}`;

        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            invoiceNumber: formattedNumber,
            company: { id: companyId } as any
        });

        const savedInvoice = await this.invoiceRepository.save(invoice);

        // Increment the number for next time
        await this.companyRepository.update(companyId, {
            nextInvoiceNumber: currentNumber + 1
        });

        return savedInvoice;
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
