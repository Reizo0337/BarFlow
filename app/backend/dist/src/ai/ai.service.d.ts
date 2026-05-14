import { InventoryService } from '../inventory/inventory.service';
import { SmartImageService } from './smart-image.service';
export declare class AiService {
    private readonly inventoryService;
    private readonly smartImageService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(inventoryService: InventoryService, smartImageService: SmartImageService);
    processCommand(text: string, companyId: number, history?: any[]): Promise<any[]>;
    private executeAction;
    generateStatsSummary(stats: any, companyId: number): Promise<{
        summary: any;
    }>;
}
