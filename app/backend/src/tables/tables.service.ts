import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableOrder } from './table-order.entity';
import { Company } from '../companies/company.entity';

@Injectable()
export class TablesService {
    constructor(
        @InjectRepository(TableOrder)
        private tableOrderRepository: Repository<TableOrder>,
    ) {}

    async getPendingOrders(companyId: number): Promise<TableOrder[]> {
        return this.tableOrderRepository.find({
            where: { company: { id: companyId } },
            order: { tableNumber: 'ASC' }
        });
    }

    async saveOrder(tableNumber: string, cartData: string, total: number, companyId: number): Promise<TableOrder> {
        let order = await this.tableOrderRepository.findOne({
            where: { tableNumber, company: { id: companyId } }
        });

        if (!order) {
            order = this.tableOrderRepository.create({ tableNumber, company: { id: companyId } as Company });
        }

        order.cartData = cartData;
        order.total = total;
        order.lastUpdated = new Date();

        return this.tableOrderRepository.save(order);
    }

    async deleteOrder(tableNumber: string, companyId: number): Promise<void> {
        await this.tableOrderRepository.delete({ tableNumber, company: { id: companyId } });
    }
}
