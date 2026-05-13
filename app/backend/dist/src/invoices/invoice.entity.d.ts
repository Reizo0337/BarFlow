import { Company } from '../companies/company.entity';
export declare class Invoice {
    id: number;
    invoiceNumber: string;
    type: 'in' | 'out' | 'sale' | 'purchase';
    clientName: string;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
    paymentMethod: string;
    previousHash: string;
    hash: string;
    createdAt: Date;
    company: Company;
}
