import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    findAll(companyId: number): Promise<Product[]> {
        return this.productRepository.find({
            where: { company: { id: companyId } },
            relations: ['company']
        });
    }

    async findAllCategories(companyId: number): Promise<string[]> {
        const products = await this.productRepository.find({
            where: { company: { id: companyId } },
            select: ['category']
        });

        const categories = products.map(p => p.category);
        return [...new Set(categories)];
    }

    findOne(id: number, companyId: number): Promise<Product | null> {
        return this.productRepository.findOne({
            where: { id, company: { id: companyId } }
        });
    }

    create(createProductDto: CreateProductDto, companyId: number): Promise<Product> {
        const product = this.productRepository.create({
            ...createProductDto,
            company: { id: companyId } as any
        });
        return this.productRepository.save(product);
    }

    async update(id: number, updateProductDto: UpdateProductDto, companyId: number): Promise<Product | null> {
        const product = await this.findOne(id, companyId);
        if (!product) return null;

        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id, companyId);
    }

    async remove(id: number, companyId: number): Promise<void> {
        const product = await this.findOne(id, companyId);
        if (product) {
            await this.productRepository.delete(id);
        }
    }
}
