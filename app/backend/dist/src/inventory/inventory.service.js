"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const category_entity_1 = require("./category.entity");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let InventoryService = class InventoryService {
    productRepository;
    categoryRepository;
    uploadDir = './uploads/products';
    constructor(productRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async downloadAndSaveImage(url) {
        if (!url || !url.startsWith('http'))
            return url;
        try {
            const response = await (0, axios_1.default)({
                url,
                method: 'GET',
                responseType: 'stream',
                timeout: 5000
            });
            const fileName = `${(0, uuid_1.v4)()}.jpg`;
            const filePath = path.join(this.uploadDir, fileName);
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(`/uploads/products/${fileName}`));
                writer.on('error', (err) => {
                    console.error('Writer error:', err.message);
                    resolve(url);
                });
            });
        }
        catch (error) {
            console.error('Error downloading image:', error.message);
            return url;
        }
    }
    findAll(companyId) {
        return this.productRepository.find({
            where: { company: { id: companyId } },
            relations: ['company', 'category']
        });
    }
    findAllCategories(companyId) {
        return this.categoryRepository.find({
            where: { company: { id: companyId } }
        });
    }
    async findCategoryByName(name, companyId) {
        return this.categoryRepository.createQueryBuilder('category')
            .where('LOWER(category.name) = LOWER(:name)', { name })
            .andWhere('category.companyId = :companyId', { companyId })
            .getOne();
    }
    async createCategory(name, companyId) {
        const category = this.categoryRepository.create({
            name,
            company: { id: companyId }
        });
        return this.categoryRepository.save(category);
    }
    async updateCategory(id, name, companyId) {
        await this.categoryRepository.update({ id, company: { id: companyId } }, { name });
        return this.categoryRepository.findOne({ where: { id, company: { id: companyId } } });
    }
    async removeCategory(id, companyId) {
        await this.categoryRepository.delete({ id, company: { id: companyId } });
    }
    findOne(id, companyId) {
        return this.productRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['category']
        });
    }
    async create(createProductDto, companyId) {
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
            rest.image = await this.downloadAndSaveImage(rest.image);
        }
        return this.productRepository.save({
            ...rest,
            category: categoryId ? { id: categoryId } : null,
            company: { id: companyId }
        });
    }
    async update(id, updateProductDto, companyId) {
        const product = await this.findOne(id, companyId);
        if (!product)
            return null;
        if (updateProductDto.categoryId) {
            updateProductDto.category = { id: updateProductDto.categoryId };
            delete updateProductDto.categoryId;
        }
        else if (updateProductDto.categoryName) {
            let category = await this.findCategoryByName(updateProductDto.categoryName, companyId);
            if (!category) {
                category = await this.createCategory(updateProductDto.categoryName, companyId);
            }
            updateProductDto.category = { id: category.id };
            delete updateProductDto.categoryName;
        }
        if (updateProductDto.image && updateProductDto.image.startsWith('http')) {
            updateProductDto.image = await this.downloadAndSaveImage(updateProductDto.image);
        }
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id, companyId);
    }
    async bulkUpdate(companyId, data) {
        let products = await this.findAll(companyId);
        if (data.categoryName) {
            products = products.filter(p => p.category?.name.toLowerCase() === data.categoryName?.toLowerCase());
        }
        let updatedCount = 0;
        for (const product of products) {
            const updates = {};
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
    async remove(id, companyId) {
        const product = await this.findOne(id, companyId);
        if (product) {
            await this.productRepository.delete(id);
        }
    }
    async findByName(name, companyId) {
        return this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .where('LOWER(product.name) = LOWER(:name)', { name })
            .andWhere('product.companyId = :companyId', { companyId })
            .getOne();
    }
    async updateStockDelta(id, delta, companyId) {
        const product = await this.findOne(id, companyId);
        if (!product)
            return null;
        product.stock = Math.max(0, product.stock + delta);
        return this.productRepository.save(product);
    }
    async findGlobalByName(name) {
        return this.productRepository.createQueryBuilder('product')
            .where('LOWER(product.name) = LOWER(:name)', { name })
            .andWhere('product.image IS NOT NULL')
            .andWhere('product.image != ""')
            .getOne();
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map