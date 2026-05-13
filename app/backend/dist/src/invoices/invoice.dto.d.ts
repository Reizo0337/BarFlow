export declare class CreateInvoiceDto {
    invoiceNumber?: string;
    type: 'in' | 'out' | 'sale' | 'purchase';
    clientName: string;
    amount: number;
    status?: 'paid' | 'pending' | 'cancelled';
    paymentMethod?: string;
    taxableBase?: number;
    vatRate?: number;
    vatAmount?: number;
    series?: string;
    terminalId?: string;
    items?: any[];
    clientId?: number;
}
export declare class UpdateInvoiceDto {
    invoiceNumber?: string;
    type?: 'in' | 'out' | 'sale' | 'purchase';
    clientName?: string;
    amount?: number;
    status?: 'paid' | 'pending' | 'cancelled';
    paymentMethod?: string;
}
