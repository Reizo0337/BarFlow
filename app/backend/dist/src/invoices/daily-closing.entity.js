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
exports.DailyClosing = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("../companies/company.entity");
const user_entity_1 = require("../users/user.entity");
const numeric_transformer_1 = require("../common/numeric-transformer");
let DailyClosing = class DailyClosing {
    id;
    timestamp;
    closingNumber;
    firstInvoiceNumber;
    lastInvoiceNumber;
    totalAmount;
    totalVat;
    expectedCash;
    actualCash;
    expectedCard;
    totalSalesCount;
    vatBreakdown;
    itemizedSales;
    user;
    company;
};
exports.DailyClosing = DailyClosing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DailyClosing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DailyClosing.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DailyClosing.prototype, "closingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DailyClosing.prototype, "firstInvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DailyClosing.prototype, "lastInvoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "totalVat", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 0
    }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "expectedCash", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 0
    }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "actualCash", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer(),
        default: 0
    }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "expectedCard", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DailyClosing.prototype, "totalSalesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyClosing.prototype, "vatBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], DailyClosing.prototype, "itemizedSales", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], DailyClosing.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company),
    __metadata("design:type", company_entity_1.Company)
], DailyClosing.prototype, "company", void 0);
exports.DailyClosing = DailyClosing = __decorate([
    (0, typeorm_1.Entity)()
], DailyClosing);
//# sourceMappingURL=daily-closing.entity.js.map