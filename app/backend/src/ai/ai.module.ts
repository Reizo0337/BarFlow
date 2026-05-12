import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
    imports: [InventoryModule, CompaniesModule],
    providers: [AiService],
    controllers: [AiController],
})
export class AiModule {}
