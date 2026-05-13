import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';
import { Invoice } from '../invoices/invoice.entity';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Client, Invoice])],
    providers: [ClientsService],
    controllers: [ClientsController],
    exports: [ClientsService]
})
export class ClientsModule {}
