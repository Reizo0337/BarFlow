export declare class CreateInvoiceDto {
    invoiceNumber?: string;
    type: 'in' | 'out' | 'sale' | 'purchase';
    clientName: string;
    amount: number;
    status?: 'paid' | 'pending' | 'cancelled';
    paymentMethod?: string;
}
export declare class UpdateInvoiceDto {
    invoiceNumber?: string;
    type?: 'in' | 'out';
    clientName?: string;
    amount?: number;
    status?: 'paid' | 'pending' | 'cancelled';
}
