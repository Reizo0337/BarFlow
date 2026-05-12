import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category])],
    providers: [InventoryService],
    controllers: [InventoryController],
    exports: [InventoryService, TypeOrmModule],
})
export class InventoryModule { }
