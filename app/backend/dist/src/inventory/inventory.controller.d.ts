import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(req: any): Promise<import("./product.entity").Product[]>;
    findOne(id: string, req: any): Promise<import("./product.entity").Product | null>;
    create(createProductDto: CreateProductDto, req: any): Promise<import("./product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./product.entity").Product | null>;
    remove(id: string, req: any): Promise<void>;
}
