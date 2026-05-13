import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { FileService } from '../common/file.service';
export declare class InventoryController {
    private readonly inventoryService;
    private readonly fileService;
    constructor(inventoryService: InventoryService, fileService: FileService);
    uploadFile(file: any): Promise<{
        url: string;
    }>;
    findAll(req: any): Promise<import("./product.entity").Product[]>;
    findAllCategories(req: any): Promise<import("./category.entity").Category[]>;
    findOne(id: string, req: any): Promise<import("./product.entity").Product | null>;
    create(createProductDto: CreateProductDto, req: any): Promise<import("./product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./product.entity").Product | null>;
    remove(id: string, req: any): Promise<void>;
    updateStock(id: string, body: {
        delta: number;
    }, req: any): Promise<import("./product.entity").Product | null>;
    createCategory(body: {
        name: string;
    }, req: any): Promise<import("./category.entity").Category>;
    updateCategory(id: string, body: {
        name: string;
    }, req: any): Promise<import("./category.entity").Category | null>;
    removeCategory(id: string, req: any): Promise<void>;
    applyTemplate(template: any[], req: any): Promise<void>;
}
