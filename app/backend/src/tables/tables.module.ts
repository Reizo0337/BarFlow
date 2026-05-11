import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableOrder } from './table-order.entity';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TableOrder])],
    providers: [TablesService],
    controllers: [TablesController],
    exports: [TablesService]
})
export class TablesModule {}
