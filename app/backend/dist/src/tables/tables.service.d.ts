import { Repository } from 'typeorm';
import { TableOrder } from './table-order.entity';
export declare class TablesService {
    private tableOrderRepository;
    constructor(tableOrderRepository: Repository<TableOrder>);
    getPendingOrders(companyId: number): Promise<TableOrder[]>;
    saveOrder(tableNumber: string, cartData: string, total: number, companyId: number): Promise<TableOrder>;
    deleteOrder(tableNumber: string, companyId: number): Promise<void>;
}
