import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    invoiceNumber: string;

    @IsEnum(['in', 'out'])
    type: 'in' | 'out';

    @IsString()
    @IsNotEmpty()
    clientName: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsEnum(['paid', 'pending', 'cancelled'])
    @IsOptional()
    status?: 'paid' | 'pending' | 'cancelled';
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
