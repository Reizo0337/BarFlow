import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { FileService } from '../common/file.service';

@Injectable()
export class InventoryService {
    private readonly uploadDir = './uploads/products';

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private fileService: FileService,
    ) {}

    findAll(companyId: number): Promise<Product[]> {
        return this.productRepository.find({
            where: { company: { id: companyId } },
            relations: ['company', 'category']
        });
    }

    findAllCategories(companyId: number): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { company: { id: companyId } }
        });
    }

    async findCategoryByName(name: string, companyId: number): Promise<Category | null> {
        return this.categoryRepository.createQueryBuilder('category')
            .where('LOWER(category.name) = LOWER(:name)', { name })
            .andWhere('category.companyId = :companyId', { companyId })
            .getOne();
    }

    async createCategory(name: string, companyId: number): Promise<Category> {
        const category = this.categoryRepository.create({
            name,
            company: { id: companyId } as any
        });
        return this.categoryRepository.save(category);
    }

    async updateCategory(id: number, name: string, companyId: number): Promise<Category | null> {
        await this.categoryRepository.update({ id, company: { id: companyId } as any }, { name });
        return this.categoryRepository.findOne({ where: { id, company: { id: companyId } as any } });
    }

    async removeCategory(id: number, companyId: number): Promise<void> {
        await this.categoryRepository.delete({ id, company: { id: companyId } as any });
    }

    findOne(id: number, companyId: number): Promise<Product | null> {
        return this.productRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['category']
        });
    }

    async create(createProductDto: CreateProductDto | any, companyId: number): Promise<Product> {
        let categoryId = createProductDto.categoryId;
        const catName = createProductDto.categoryName || (typeof createProductDto.category === 'string' ? createProductDto.category : null);

        if (catName) {
            let category = await this.findCategoryByName(catName, companyId);
            if (!category) {
                category = await this.createCategory(catName, companyId);
            }
            categoryId = category.id;
        }

        const { category, categoryName, ...rest } = createProductDto;

        if (rest.image && rest.image.startsWith('http')) {
            rest.image = await this.fileService.downloadAndSaveImage(rest.image, this.uploadDir);
        }

        return this.productRepository.save({
            ...rest,
            category: categoryId ? { id: categoryId } : null,
            company: { id: companyId } as any
        });
    }

    async update(id: number, updateProductDto: UpdateProductDto | any, companyId: number): Promise<Product | null> {
        const product = await this.findOne(id, companyId);
        if (!product) return null;

        if (updateProductDto.categoryId) {
            updateProductDto.category = { id: updateProductDto.categoryId };
            delete updateProductDto.categoryId;
        } else if (updateProductDto.categoryName) {
            let category = await this.findCategoryByName(updateProductDto.categoryName, companyId);
            if (!category) {
                category = await this.createCategory(updateProductDto.categoryName, companyId);
            }
            updateProductDto.category = { id: category.id };
            delete updateProductDto.categoryName;
        }

        if (updateProductDto.image && updateProductDto.image.startsWith('http')) {
            updateProductDto.image = await this.fileService.downloadAndSaveImage(updateProductDto.image, this.uploadDir);
        }

        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id, companyId);
    }

    async bulkUpdate(companyId: number, data: { categoryName?: string, priceAdjustment?: number, stockAdjustment?: number }): Promise<number> {
        let products = await this.findAll(companyId);

        if (data.categoryName) {
            products = products.filter(p => p.category?.name.toLowerCase() === data.categoryName?.toLowerCase());
        }

        let updatedCount = 0;
        for (const product of products) {
            const updates: any = {};
            if (data.priceAdjustment) {
                const factor = 1 + (data.priceAdjustment / 100);
                updates.price = Number((product.price * factor).toFixed(2));
            }
            if (data.stockAdjustment) {
                updates.stock = product.stock + data.stockAdjustment;
            }
            if (Object.keys(updates).length > 0) {
                await this.productRepository.update(product.id, updates);
                updatedCount++;
            }
        }
        return updatedCount;
    }

    async remove(id: number, companyId: number): Promise<void> {
        const product = await this.findOne(id, companyId);
        if (product) await this.productRepository.delete(id);
    }

    async findByName(name: string, companyId: number): Promise<Product | null> {
        return this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('LOWER(product.name) = LOWER(:name)', { name })
            .andWhere('product.companyId = :companyId', { companyId })
            .getOne();
    }

    async updateStockDelta(id: number, delta: number, companyId: number): Promise<Product | null> {
        const product = await this.findOne(id, companyId);
        if (!product) return null;
        product.stock = Math.max(0, product.stock + delta);
        return this.productRepository.save(product);
    }

    async findGlobalByName(name: string): Promise<Product | null> {
        return this.productRepository.createQueryBuilder('product')
            .where('LOWER(product.name) = LOWER(:name)', { name })
            .andWhere('product.image IS NOT NULL')
            .andWhere('product.image != ""')
            .getOne();
    }
}
