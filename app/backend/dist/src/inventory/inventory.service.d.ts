import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';
export declare class InventoryService {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    findAll(companyId: number): Promise<Product[]>;
    findAllCategories(companyId: number): Promise<string[]>;
    findOne(id: number, companyId: number): Promise<Product | null>;
    create(createProductDto: CreateProductDto, companyId: number): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto, companyId: number): Promise<Product | null>;
    remove(id: number, companyId: number): Promise<void>;
}
