import { Company } from '../companies/company.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Client } from '../clients/client.entity';
export declare class Invoice {
    id: number;
    invoiceNumber: string;
    type: 'in' | 'out' | 'sale' | 'purchase';
    clientName: string;
    amount: number;
    taxableBase: number;
    vatRate: number;
    vatAmount: number;
    series: string;
    terminalId: string;
    fiscalStatus: 'normal' | 'rectificative' | 'cancelled';
    aeatSent: boolean;
    aeatSentAt: Date;
    paymentMethod: string;
    previousHash: string;
    hash: string;
    createdAt: Date;
    company: Company;
    items: InvoiceItem[];
    client: Client;
    closing: any;
}
