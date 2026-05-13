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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const invoice_dto_1 = require("./invoice.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const fiscal_service_1 = require("../fiscal/fiscal.service");
let InvoicesController = class InvoicesController {
    invoicesService;
    fiscalService;
    constructor(invoicesService, fiscalService) {
        this.invoicesService = invoicesService;
        this.fiscalService = fiscalService;
    }
    getClosingStats(req) {
        return this.invoicesService.getClosingStats(req.user.companyId);
    }
    getClosingHistory(req) {
        return this.invoicesService.getClosingHistory(req.user.companyId);
    }
    performDailyClosing(req, body) {
        return this.invoicesService.performDailyClosing(req.user.companyId, req.user, body.actualCash);
    }
    findAll(req) {
        return this.invoicesService.findAll(req.user.companyId);
    }
    create(createInvoiceDto, req) {
        return this.invoicesService.create(createInvoiceDto, req.user.companyId, req.user);
    }
    async getVerifactuJSON(id, req) {
        const invoice = await this.invoicesService.findOne(+id, req.user.companyId);
        if (!invoice)
            throw new Error('Invoice not found');
        return this.fiscalService.generateVerifactuJSON(invoice);
    }
    findOne(id, req) {
        return this.invoicesService.findOne(+id, req.user.companyId);
    }
    update(id, updateInvoiceDto, req) {
        return this.invoicesService.update(+id, updateInvoiceDto, req.user.companyId);
    }
    remove(id, req) {
        return this.invoicesService.remove(+id, req.user.companyId);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)('daily-closing/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current stats for the daily closing' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getClosingStats", null);
__decorate([
    (0, common_1.Get)('daily-closing/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get history of Z-reports' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getClosingHistory", null);
__decorate([
    (0, common_1.Post)('daily-closing'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform a daily Z-report closing (Law Compliance)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "performDailyClosing", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice (Fiscal Record)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/verifactu'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Veri*factu compliant JSON for an invoice' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getVerifactuJSON", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one invoice' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an invoice (Restricted by Law 11/2021)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoice_dto_1.UpdateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an invoice (Forbidden by Law 11/2021)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "remove", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService,
        fiscal_service_1.FiscalService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map