import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { FiscalService } from '../fiscal/fiscal.service';
export declare class InvoicesController {
    private readonly invoicesService;
    private readonly fiscalService;
    constructor(invoicesService: InvoicesService, fiscalService: FiscalService);
    getClosingStats(req: any): Promise<{
        totalAmount: number;
        totalSalesCount: number;
        cashTotal: number;
        cardTotal: number;
        vatBreakdown: Record<string, number>;
        topProducts: {
            quantity: number;
            total: number;
            name: string;
        }[];
        lowStockItems: never[];
    }>;
    getClosingHistory(req: any): Promise<import("./daily-closing.entity").DailyClosing[]>;
    performDailyClosing(req: any, body: {
        actualCash: number;
    }): Promise<import("./daily-closing.entity").DailyClosing>;
    findAll(req: any): Promise<import("./invoice.entity").Invoice[]>;
    create(createInvoiceDto: CreateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice>;
    getVerifactuJSON(id: string, req: any): Promise<{
        IDVersion: string;
        Cabecera: {
            IDEmisorFacturacion: {
                NIF: string;
                NombreRazon: string;
            };
            TimestampRegistro: string;
        };
        RegistroFacturacion: {
            IDFactura: {
                IDEmisorFactura: string;
                NumSerieFactura: string;
                FechaExpedicionFactura: string;
            };
            TipoFactura: string;
            ImporteTotal: string;
            DesgloseIVA: {
                BaseImponible: string;
                TipoImpositivo: string;
                CuotaRepercutida: string;
            }[];
            Huella: string;
            TerminalID: string;
        };
    }>;
    findOne(id: string, req: any): Promise<import("./invoice.entity").Invoice | null>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, req: any): Promise<import("./invoice.entity").Invoice | null>;
    remove(id: string, req: any): Promise<void>;
}
