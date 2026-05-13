import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { DailyClosing } from './daily-closing.entity';
import { Company } from '../companies/company.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Client } from '../clients/client.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { FiscalModule } from '../fiscal/fiscal.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, Company, DailyClosing, InvoiceItem, Client]),
        FiscalModule,
        AuditLogsModule
    ],
    providers: [InvoicesService],
    controllers: [InvoicesController],
    exports: [InvoicesService],
})
export class InvoicesModule { }
