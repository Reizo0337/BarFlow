import { InventoryService } from '../inventory/inventory.service';
export declare class AiService {
    private readonly inventoryService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(inventoryService: InventoryService);
    processCommand(text: string, companyId: number, history?: any[]): Promise<any[]>;
    private executeAction;
}
