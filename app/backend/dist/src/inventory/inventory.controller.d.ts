import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    uploadFile(file: any): {
        url: string;
    };
    findAll(req: any): Promise<import("./product.entity").Product[]>;
    findAllCategories(req: any): Promise<import("./category.entity").Category[]>;
    findOne(id: string, req: any): Promise<import("./product.entity").Product | null>;
    create(createProductDto: CreateProductDto, req: any): Promise<import("./product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./product.entity").Product | null>;
    remove(id: string, req: any): Promise<void>;
    createCategory(body: {
        name: string;
    }, req: any): Promise<import("./category.entity").Category>;
    updateCategory(id: string, body: {
        name: string;
    }, req: any): Promise<import("./category.entity").Category | null>;
    removeCategory(id: string, req: any): Promise<void>;
}
