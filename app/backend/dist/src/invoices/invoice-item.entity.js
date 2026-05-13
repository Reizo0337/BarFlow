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
exports.InvoiceItem = void 0;
const typeorm_1 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const numeric_transformer_1 = require("../common/numeric-transformer");
let InvoiceItem = class InvoiceItem {
    id;
    productName;
    quantity;
    price;
    total;
    invoice;
};
exports.InvoiceItem = InvoiceItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InvoiceItem.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new numeric_transformer_1.ColumnNumericTransformer()
    }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_entity_1.Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' }),
    __metadata("design:type", invoice_entity_1.Invoice)
], InvoiceItem.prototype, "invoice", void 0);
exports.InvoiceItem = InvoiceItem = __decorate([
    (0, typeorm_1.Entity)()
], InvoiceItem);
//# sourceMappingURL=invoice-item.entity.js.map