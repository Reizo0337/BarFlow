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
exports.FiscalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../invoices/invoice.entity");
const crypto = __importStar(require("crypto"));
let FiscalService = class FiscalService {
    invoiceRepository;
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async calculateChainedHash(invoice, companyId) {
        const lastInvoice = await this.invoiceRepository.findOne({
            where: {
                company: { id: companyId },
                series: invoice.series || 'A'
            },
            order: { createdAt: 'DESC', invoiceNumber: 'DESC' }
        });
        const previousHash = lastInvoice?.hash || '0'.repeat(64);
        const dataToHash = {
            nif: invoice.company?.nif || '',
            number: invoice.invoiceNumber,
            series: invoice.series,
            date: invoice.createdAt?.toISOString(),
            amount: Number(invoice.amount).toFixed(2),
            previousHash: previousHash
        };
        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify(dataToHash))
            .digest('hex');
        return { hash, previousHash };
    }
    async validateSequence(companyId, series, newNumber) {
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId }, series },
            order: { invoiceNumber: 'DESC' }
        });
        if (!lastInvoice)
            return true;
        const lastNum = parseInt(lastInvoice.invoiceNumber);
        return newNumber === lastNum + 1;
    }
    generateVerifactuJSON(invoice) {
        return {
            IDVersion: "1.0",
            Cabecera: {
                IDEmisorFacturacion: {
                    NIF: invoice.company.nif,
                    NombreRazon: invoice.company.legalName
                },
                TimestampRegistro: invoice.createdAt.toISOString()
            },
            RegistroFacturacion: {
                IDFactura: {
                    IDEmisorFactura: invoice.company.nif,
                    NumSerieFactura: `${invoice.series}-${invoice.invoiceNumber}`,
                    FechaExpedicionFactura: invoice.createdAt.toISOString().split('T')[0]
                },
                TipoFactura: "F1",
                ImporteTotal: invoice.amount.toFixed(2),
                DesgloseIVA: [
                    {
                        BaseImponible: invoice.taxableBase.toFixed(2),
                        TipoImpositivo: invoice.vatRate.toString(),
                        CuotaRepercutida: invoice.vatAmount.toFixed(2)
                    }
                ],
                Huella: invoice.hash,
                TerminalID: invoice.terminalId || "T01"
            }
        };
    }
};
exports.FiscalService = FiscalService;
exports.FiscalService = FiscalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FiscalService);
//# sourceMappingURL=fiscal.service.js.map