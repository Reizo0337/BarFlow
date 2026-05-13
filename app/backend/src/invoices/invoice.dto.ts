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

    @IsNumber()
    @IsOptional()
    @Min(0)
    taxableBase?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    vatRate?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    vatAmount?: number;

    @IsString()
    @IsOptional()
    series?: string;

    @IsString()
    @IsOptional()
    terminalId?: string;

    @IsOptional()
    items?: any[];

    @IsNumber()
    @IsOptional()
    clientId?: number;
}

export class UpdateInvoiceDto {
    @IsString()
    @IsOptional()
    invoiceNumber?: string;

    @IsEnum(['in', 'out', 'sale', 'purchase'])
    @IsOptional()
    type?: 'in' | 'out' | 'sale' | 'purchase';

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

    @IsString()
    @IsOptional()
    paymentMethod?: string;
}
