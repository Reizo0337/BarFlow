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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const daily_closing_entity_1 = require("./daily-closing.entity");
const company_entity_1 = require("../companies/company.entity");
const fiscal_service_1 = require("../fiscal/fiscal.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let InvoicesService = class InvoicesService {
    invoiceRepository;
    companyRepository;
    dailyClosingRepository;
    fiscalService;
    auditLogsService;
    constructor(invoiceRepository, companyRepository, dailyClosingRepository, fiscalService, auditLogsService) {
        this.invoiceRepository = invoiceRepository;
        this.companyRepository = companyRepository;
        this.dailyClosingRepository = dailyClosingRepository;
        this.fiscalService = fiscalService;
        this.auditLogsService = auditLogsService;
    }
    async findAll(companyId) {
        return this.invoiceRepository.find({
            where: { company: { id: companyId } },
            relations: ['company'],
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id, companyId) {
        return await this.invoiceRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['company', 'items']
        });
    }
    async create(createInvoiceDto, companyId, user) {
        const company = await this.companyRepository.findOne({ where: { id: companyId } });
        if (!company)
            throw new Error('Empresa no encontrada para facturación.');
        const series = createInvoiceDto.series || 'A';
        const terminalId = createInvoiceDto.terminalId || 'T01';
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId }, series },
            order: { invoiceNumber: 'DESC' }
        });
        let nextNum = lastInvoice ? (parseInt(lastInvoice.invoiceNumber.replace(/\D/g, '')) || 0) + 1 : 1;
        if (nextNum > 1000000000) {
            const actualCount = await this.invoiceRepository.count({
                where: { company: { id: companyId }, series }
            });
            nextNum = actualCount + 1;
        }
        const formattedNumber = nextNum.toString().padStart(6, '0');
        const taxableBase = createInvoiceDto.taxableBase ?? (createInvoiceDto.amount / 1.1);
        const vatRate = createInvoiceDto.vatRate ?? 10;
        const vatAmount = createInvoiceDto.vatAmount ?? (createInvoiceDto.amount - taxableBase);
        const tempInvoice = {
            invoiceNumber: formattedNumber,
            series: series,
            amount: Number(createInvoiceDto.amount),
            taxableBase: Number(taxableBase),
            vatAmount: Number(vatAmount),
            vatRate: Number(vatRate),
            createdAt: new Date(),
            company: company
        };
        const { hash, previousHash } = await this.fiscalService.calculateChainedHash(tempInvoice, companyId);
        const invoice = this.invoiceRepository.create({
            ...createInvoiceDto,
            taxableBase,
            vatAmount,
            vatRate,
            invoiceNumber: formattedNumber,
            series,
            terminalId,
            company,
            hash,
            previousHash,
            fiscalStatus: 'normal',
            aeatSent: false,
            client: createInvoiceDto.clientId ? { id: createInvoiceDto.clientId } : undefined,
            items: createInvoiceDto.items?.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            }))
        });
        const savedInvoice = await this.invoiceRepository.save(invoice);
        await this.auditLogsService.log({ id: user.userId || user.id }, company, 'FISCAL_RECORD_CREATED', {
            invoiceId: savedInvoice.id,
            invoiceNumber: `${series}-${formattedNumber}`,
            hash: savedInvoice.hash
        }, `Registro fiscal generado y encadenado correctamente.`);
        if (!isNaN(nextNum)) {
            await this.companyRepository.update(companyId, { nextInvoiceNumber: nextNum + 1 });
        }
        return savedInvoice;
    }
    async update(id, updateInvoiceDto, companyId) {
        const invoice = await this.findOne(id, companyId);
        if (!invoice)
            return null;
        const criticalFields = ['amount', 'taxableBase', 'vatAmount', 'vatRate', 'invoiceNumber', 'series'];
        for (const field of criticalFields) {
            if (updateInvoiceDto[field] !== undefined && updateInvoiceDto[field] !== invoice[field]) {
                throw new Error(`VIOLACIÓN LEY 11/2021: El campo ${field} es inmutable tras la emisión del registro fiscal.`);
            }
        }
        if (Object.keys(updateInvoiceDto).length > 0) {
            await this.invoiceRepository.update(id, updateInvoiceDto);
        }
        return this.findOne(id, companyId);
    }
    async remove(id, companyId) {
        throw new Error('VIOLACIÓN LEY 11/2021: La eliminación física de registros de facturación está prohibida. Use facturas rectificativas para anular operaciones.');
    }
    async getClosingStats(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                createdAt: (0, typeorm_2.Between)(today, tomorrow),
                type: 'sale'
            }
        });
        return {
            totalAmount: invoices.reduce((s, i) => s + i.amount, 0),
            totalSalesCount: invoices.length,
            cashTotal: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + i.amount, 0),
            cardTotal: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + i.amount, 0),
            topProducts: [],
            lowStockItems: []
        };
    }
    async performDailyClosing(companyId, user, actualCash) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                createdAt: (0, typeorm_2.Between)(today, tomorrow),
                type: 'sale'
            },
            order: { createdAt: 'ASC' }
        });
        if (invoices.length === 0)
            throw new Error('No hay ventas registradas para hoy.');
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const totalVat = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0);
        const lastClosing = await this.dailyClosingRepository.findOne({
            where: { company: { id: companyId } },
            order: { closingNumber: 'DESC' }
        });
        const nextClosingNumber = lastClosing ? lastClosing.closingNumber + 1 : 1;
        const closing = this.dailyClosingRepository.create({
            company: { id: companyId },
            user,
            closingNumber: nextClosingNumber,
            firstInvoiceNumber: invoices[0].invoiceNumber,
            lastInvoiceNumber: invoices[invoices.length - 1].invoiceNumber,
            totalAmount,
            totalVat,
            expectedCash: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + i.amount, 0),
            actualCash,
            expectedCard: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + i.amount, 0),
            totalSalesCount: invoices.length,
            vatBreakdown: JSON.stringify({ '10%': totalVat }),
            itemizedSales: JSON.stringify([])
        });
        return await this.dailyClosingRepository.save(closing);
    }
    async getClosingHistory(companyId) {
        return await this.dailyClosingRepository.find({
            where: { company: { id: companyId } },
            relations: ['user'],
            order: { timestamp: 'DESC' }
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(2, (0, typeorm_1.InjectRepository)(daily_closing_entity_1.DailyClosing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        fiscal_service_1.FiscalService,
        audit_logs_service_1.AuditLogsService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map