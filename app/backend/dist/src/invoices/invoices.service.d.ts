import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { DailyClosing } from './daily-closing.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { Company } from '../companies/company.entity';
import { FiscalService } from '../fiscal/fiscal.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class InvoicesService {
    private invoiceRepository;
    private companyRepository;
    private dailyClosingRepository;
    private fiscalService;
    private auditLogsService;
    constructor(invoiceRepository: Repository<Invoice>, companyRepository: Repository<Company>, dailyClosingRepository: Repository<DailyClosing>, fiscalService: FiscalService, auditLogsService: AuditLogsService);
    findAll(companyId: number): Promise<Invoice[]>;
    findOne(id: number, companyId: number): Promise<Invoice | null>;
    create(createInvoiceDto: CreateInvoiceDto, companyId: number, user: any): Promise<Invoice>;
    update(id: number, updateInvoiceDto: UpdateInvoiceDto, companyId: number): Promise<Invoice | null>;
    remove(id: number, companyId: number): Promise<void>;
    getClosingStats(companyId: number): Promise<{
        totalAmount: number;
        totalSalesCount: number;
        cashTotal: number;
        cardTotal: number;
        vatBreakdown: Record<string, number>;
        topProducts: {
            quantity: number;
            total: number;
            name: string;
        }[];
        lowStockItems: never[];
    }>;
    performDailyClosing(companyId: number, user: any, actualCash: number): Promise<DailyClosing>;
    getClosingHistory(companyId: number): Promise<DailyClosing[]>;
}
