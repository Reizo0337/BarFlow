import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalService } from './fiscal.service';
import { Invoice } from '../invoices/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Invoice])],
    providers: [FiscalService],
    exports: [FiscalService]
})
export class FiscalModule {}
