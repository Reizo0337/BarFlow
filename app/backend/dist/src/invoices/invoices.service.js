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
            where: { company: { id: companyId }, series: series },
            order: { invoiceNumber: 'DESC' }
        });
        let nextNum = company.nextInvoiceNumber || 1;
        if (lastInvoice) {
            const parsed = parseInt(lastInvoice.invoiceNumber);
            if (!isNaN(parsed)) {
                nextNum = Math.max(nextNum, parsed + 1);
            }
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
        try {
            await this.auditLogsService.log({ id: user.userId || user.id }, company, 'FISCAL_RECORD_CREATED', {
                invoiceId: savedInvoice.id,
                invoiceNumber: `${series}-${formattedNumber}`,
                hash: savedInvoice.hash
            }, `Registro fiscal generado y encadenado correctamente.`);
        }
        catch (error) {
            console.error('Error creating audit log:', error);
        }
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
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                closing: (0, typeorm_2.IsNull)(),
                type: 'sale'
            },
            relations: ['items']
        });
        const itemizedMap = {};
        const vatMap = {};
        invoices.forEach(inv => {
            const rateKey = `${inv.vatRate}%`;
            vatMap[rateKey] = (vatMap[rateKey] || 0) + Number(inv.vatAmount);
            inv.items?.forEach(item => {
                if (!itemizedMap[item.productName])
                    itemizedMap[item.productName] = { quantity: 0, total: 0 };
                itemizedMap[item.productName].quantity += Number(item.quantity);
                itemizedMap[item.productName].total += Number(item.total);
            });
        });
        return {
            totalAmount: invoices.reduce((s, i) => s + Number(i.amount), 0),
            totalSalesCount: invoices.length,
            cashTotal: invoices.filter(inv => inv.paymentMethod === 'cash').reduce((s, i) => s + Number(i.amount), 0),
            cardTotal: invoices.filter(inv => inv.paymentMethod === 'card').reduce((s, i) => s + Number(i.amount), 0),
            vatBreakdown: vatMap,
            topProducts: Object.entries(itemizedMap)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5),
            lowStockItems: []
        };
    }
    async performDailyClosing(companyId, user, actualCash) {
        const invoices = await this.invoiceRepository.find({
            where: {
                company: { id: companyId },
                closing: (0, typeorm_2.IsNull)(),
                type: 'sale'
            },
            relations: ['items'],
            order: { createdAt: 'ASC' }
        });
        if (invoices.length === 0)
            throw new Error('No hay ventas pendientes de cierre en este momento.');
        const itemizedMap = {};
        const vatMap = {};
        let totalAmount = 0;
        let totalVat = 0;
        let expectedCash = 0;
        let expectedCard = 0;
        invoices.forEach(inv => {
            totalAmount += Number(inv.amount);
            totalVat += Number(inv.vatAmount);
            if (inv.paymentMethod === 'cash')
                expectedCash += Number(inv.amount);
            if (inv.paymentMethod === 'card')
                expectedCard += Number(inv.amount);
            const rateKey = `${inv.vatRate}%`;
            if (!vatMap[rateKey])
                vatMap[rateKey] = { base: 0, vat: 0 };
            vatMap[rateKey].base += Number(inv.taxableBase);
            vatMap[rateKey].vat += Number(inv.vatAmount);
            inv.items?.forEach(item => {
                if (!itemizedMap[item.productName]) {
                    itemizedMap[item.productName] = { quantity: 0, total: 0, vat: 0 };
                }
                itemizedMap[item.productName].quantity += Number(item.quantity);
                itemizedMap[item.productName].total += Number(item.total);
                const itemVat = item.total * (inv.vatRate / 100);
                itemizedMap[item.productName].vat += itemVat;
            });
        });
        const lastClosing = await this.dailyClosingRepository.findOne({
            where: { company: { id: companyId } },
            order: { closingNumber: 'DESC' }
        });
        const nextClosingNumber = lastClosing ? lastClosing.closingNumber + 1 : 1;
        const previousHash = lastClosing?.hash || '0'.repeat(64);
        const hash = require('crypto')
            .createHash('sha256')
            .update(`${companyId}-${nextClosingNumber}-${totalAmount}-${previousHash}`)
            .digest('hex');
        const closing = this.dailyClosingRepository.create({
            company: { id: companyId },
            user: { id: user.userId || user.id },
            closingNumber: nextClosingNumber,
            firstInvoiceNumber: invoices[0].invoiceNumber,
            lastInvoiceNumber: invoices[invoices.length - 1].invoiceNumber,
            terminalId: invoices[0].terminalId || 'T01',
            totalAmount,
            totalVat,
            expectedCash,
            actualCash,
            expectedCard,
            totalSalesCount: invoices.length,
            vatBreakdown: JSON.stringify(vatMap),
            itemizedSales: JSON.stringify(Object.entries(itemizedMap).map(([name, data]) => ({
                name,
                ...data
            }))),
            previousHash,
            hash
        });
        const savedClosing = await this.dailyClosingRepository.save(closing);
        if (invoices.length > 0) {
            await this.invoiceRepository.update(invoices.map(inv => inv.id), { closing: { id: savedClosing.id } });
        }
        return savedClosing;
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