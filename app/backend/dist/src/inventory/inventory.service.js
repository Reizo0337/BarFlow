"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
let InventoryService = class InventoryService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    findAll(companyId) {
        return this.productRepository.find({
            where: { company: { id: companyId } },
            relations: ['company']
        });
    }
    async findAllCategories(companyId) {
        const products = await this.productRepository.find({
            where: { company: { id: companyId } },
            select: ['category']
        });
        const categories = products.map(p => p.category);
        return [...new Set(categories)];
    }
    findOne(id, companyId) {
        return this.productRepository.findOne({
            where: { id, company: { id: companyId } }
        });
    }
    create(createProductDto, companyId) {
        const product = this.productRepository.create({
            ...createProductDto,
            company: { id: companyId }
        });
        return this.productRepository.save(product);
    }
    async update(id, updateProductDto, companyId) {
        const product = await this.findOne(id, companyId);
        if (!product)
            return null;
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id, companyId);
    }
    async remove(id, companyId) {
        const product = await this.findOne(id, companyId);
        if (product) {
            await this.productRepository.delete(id);
        }
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map