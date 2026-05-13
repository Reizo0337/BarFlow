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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const company_entity_1 = require("../companies/company.entity");
const crypto = __importStar(require("crypto"));
let InvoicesService = class InvoicesService {
    invoiceRepository;
    companyRepository;
    constructor(invoiceRepository, companyRepository) {
        this.invoiceRepository = invoiceRepository;
        this.companyRepository = companyRepository;
    }
    calculateHash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }
    findAll(companyId) {
        return this.invoiceRepository.find({
            where: { company: { id: companyId } },
            relations: ['company'],
            order: { createdAt: 'DESC' }
        });
    }
    findOne(id, companyId) {
        return this.invoiceRepository.findOne({
            where: { id, company: { id: companyId } }
        });
    }
    async create(createInvoiceDto, companyId) {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company)
            throw new Error('Company not found');
        const currentNumber = company.nextInvoiceNumber;
        const formattedNumber = `FAC-${new Date().getFullYear()}-${currentNumber.toString().padStart(5, '0')}`;
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId } },
            order: { createdAt: 'DESC' }
        });
        const previousHash = lastInvoice ? lastInvoice.hash : '0'.repeat(64);
        const invoiceData = {
            invoiceNumber: formattedNumber,
            amount: createInvoiceDto.amount,
            clientName: createInvoiceDto.clientName,
            createdAt: new Date().toISOString(),
            previousHash,
            companyId
        };
        const hash = this.calculateHash(invoiceData);
        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            invoiceNumber: formattedNumber,
            company: { id: companyId },
            previousHash,
            hash
        });
        const savedInvoice = await this.invoiceRepository.save(invoice);
        await this.companyRepository.update(companyId, {
            nextInvoiceNumber: currentNumber + 1
        });
        return savedInvoice;
    }
    async update(id, updateInvoiceDto, companyId) {
        const invoice = await this.findOne(id, companyId);
        if (!invoice)
            return null;
        if (updateInvoiceDto.amount && updateInvoiceDto.amount !== invoice.amount) {
            throw new Error('No se puede modificar el importe de una factura emitida por ley antifraude.');
        }
        await this.invoiceRepository.update(id, updateInvoiceDto);
        return this.findOne(id, companyId);
    }
    async remove(id, companyId) {
        const invoice = await this.findOne(id, companyId);
        if (invoice) {
            throw new Error('La ley antifraude prohíbe la eliminación física de registros de facturación.');
        }
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map