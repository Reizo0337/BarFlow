import { Company } from '../companies/company.entity';
export declare class Invoice {
    id: number;
    invoiceNumber: string;
    type: 'in' | 'out';
    clientName: string;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
    createdAt: Date;
    company: Company;
}
