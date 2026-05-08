import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(req: any): Promise<import("./invoice.entity").Invoice[]>;
    findOne(id: string, req: any): Promise<import("./invoice.entity").Invoice | null>;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice | null>;
    remove(id: string, req: any): Promise<void>;
}
