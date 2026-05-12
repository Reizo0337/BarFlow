import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { CompaniesModule } from '../companies/companies.module';
import { SmartImageService } from './smart-image.service';

@Module({
    imports: [InventoryModule, CompaniesModule],
    providers: [AiService, SmartImageService],
    controllers: [AiController],
})
export class AiModule {}
