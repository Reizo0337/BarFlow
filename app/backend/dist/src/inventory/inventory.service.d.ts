import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
export declare class InventoryService {
    private productRepository;
    private categoryRepository;
    private readonly uploadDir;
    constructor(productRepository: Repository<Product>, categoryRepository: Repository<Category>);
    private downloadAndSaveImage;
    findAll(companyId: number): Promise<Product[]>;
    findAllCategories(companyId: number): Promise<Category[]>;
    findCategoryByName(name: string, companyId: number): Promise<Category | null>;
    createCategory(name: string, companyId: number): Promise<Category>;
    updateCategory(id: number, name: string, companyId: number): Promise<Category | null>;
    removeCategory(id: number, companyId: number): Promise<void>;
    findOne(id: number, companyId: number): Promise<Product | null>;
    create(createProductDto: any, companyId: number): Promise<Product>;
    update(id: number, updateProductDto: any, companyId: number): Promise<Product | null>;
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
