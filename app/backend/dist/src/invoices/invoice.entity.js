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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("../companies/company.entity");
const invoice_item_entity_1 = require("./invoice-item.entity");
const client_entity_1 = require("../clients/client.entity");
const numeric_transformer_1 = require("../common/numeric-transformer");
let Invoice = class Invoice {
    id;
    invoiceNumber;
    type;
    clientName;
    amount;
    taxableBase;
    vatRate;
    vatAmount;
    series;
    terminalId;
    fiscalStatus;
    aeatSent;
    aeatSentAt;
    paymentMethod;
    previousHash;
    hash;
    createdAt;
    company;
    items;
    client;
    closing;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 0
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxableBase", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 5,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 10
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "vatRate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 0
    }),
    __metadata("design:type", Number)
], Invoice.prototype, "vatAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'A' }),
    __metadata("design:type", String)
], Invoice.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'T01' }),
    __metadata("design:type", String)
], Invoice.prototype, "terminalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'normal' }),
    __metadata("design:type", String)
], Invoice.prototype, "fiscalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "aeatSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "aeatSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "previousHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "hash", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    __metadata("design:type", company_entity_1.Company)
], Invoice.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_item_entity_1.InvoiceItem, (item) => item.invoice, { cascade: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client, (client) => client.invoices, { nullable: true }),
    __metadata("design:type", client_entity_1.Client)
], Invoice.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('DailyClosing', { nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "closing", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)()
], Invoice);
//# sourceMappingURL=invoice.entity.js.map