import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    @IsOptional()
    invoiceNumber?: string;

    @IsEnum(['in', 'out', 'sale', 'purchase'])
    type: 'in' | 'out' | 'sale' | 'purchase';

    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsEnum(['paid', 'pending', 'cancelled'])
    @IsOptional()
    status?: 'paid' | 'pending' | 'cancelled';

    @IsString()
    @IsOptional()
    paymentMethod?: string;
}

export class UpdateInvoiceDto {
    @IsString()
    @IsOptional()
    invoiceNumber?: string;

    @IsEnum(['in', 'out'])
    @IsOptional()
    type?: 'in' | 'out';

    @IsString()
    @IsOptional()
    clientName?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    amount?: number;

    @IsEnum(['paid', 'pending', 'cancelled'])
    @IsOptional()
    status?: 'paid' | 'pending' | 'cancelled';
}
