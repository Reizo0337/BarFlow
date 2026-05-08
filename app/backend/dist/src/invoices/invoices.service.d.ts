import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
export declare class InvoicesService {
    private invoiceRepository;
    constructor(invoiceRepository: Repository<Invoice>);
    findAll(companyId: number): Promise<Invoice[]>;
    findOne(id: number, companyId: number): Promise<Invoice | null>;
    create(createInvoiceDto: CreateInvoiceDto, companyId: number): Promise<Invoice>;
    update(id: number, updateInvoiceDto: UpdateInvoiceDto, companyId: number): Promise<Invoice | null>;
    remove(id: number, companyId: number): Promise<void>;
}
