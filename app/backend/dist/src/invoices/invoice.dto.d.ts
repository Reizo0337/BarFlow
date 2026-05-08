export declare class CreateInvoiceDto {
    invoiceNumber: string;
    type: 'in' | 'out';
    clientName: string;
    amount: number;
    status?: 'paid' | 'pending' | 'cancelled';
}
export declare class UpdateInvoiceDto {
    invoiceNumber?: string;
    type?: 'in' | 'out';
    clientName?: string;
    amount?: number;
    status?: 'paid' | 'pending' | 'cancelled';
}
