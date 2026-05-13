import { Invoice } from './invoice.entity';
export declare class InvoiceItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    invoice: Invoice;
}
