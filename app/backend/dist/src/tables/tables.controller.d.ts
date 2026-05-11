import { TablesService } from './tables.service';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    getPendingOrders(req: any): Promise<import("./table-order.entity").TableOrder[]>;
    saveOrder(req: any, body: {
        tableNumber: string;
        cartData: any;
        total: number;
    }): Promise<import("./table-order.entity").TableOrder>;
    deleteOrder(req: any, tableNumber: string): Promise<void>;
}
