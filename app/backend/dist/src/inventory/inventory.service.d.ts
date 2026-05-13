import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { FileService } from '../common/file.service';
export declare class InventoryService {
    private productRepository;
    private categoryRepository;
    private fileService;
    private readonly uploadDir;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<Category>, fileService: FileService);
    findAll(companyId: number): Promise<Product[]>;
    findAllCategories(companyId: number): Promise<Category[]>;
    findCategoryByName(name: string, companyId: number): Promise<Category | null>;
    createCategory(name: string, companyId: number): Promise<Category>;
    updateCategory(id: number, name: string, companyId: number): Promise<Category | null>;
    removeCategory(id: number, companyId: number): Promise<void>;
    findOne(id: number, companyId: number): Promise<Product | null>;
    create(createProductDto: CreateProductDto | any, companyId: number): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto | any, companyId: number): Promise<Product | null>;
    bulkUpdate(companyId: number, data: {
        categoryName?: string;
        priceAdjustment?: number;
        stockAdjustment?: number;
    }): Promise<number>;
    remove(id: number, companyId: number): Promise<void>;
    findByName(name: string, companyId: number): Promise<Product | null>;
    updateStockDelta(id: number, delta: number, companyId: number): Promise<Product | null>;
    findGlobalByName(name: string): Promise<Product | null>;
}
