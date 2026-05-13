import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
export declare class DailyClosing {
    id: number;
    timestamp: Date;
    closingNumber: number;
    firstInvoiceNumber: string;
    lastInvoiceNumber: string;
    terminalId: string;
    previousHash: string;
    hash: string;
    totalAmount: number;
    totalVat: number;
    expectedCash: number;
    actualCash: number;
    expectedCard: number;
    totalSalesCount: number;
    vatBreakdown: string;
    itemizedSales: string;
    user: User;
    company: Company;
}
