import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
export declare class FiscalService {
    private invoiceRepository;
    constructor(invoiceRepository: Repository<Invoice>);
    calculateChainedHash(invoice: Partial<Invoice>, companyId: number): Promise<{
        hash: string;
        previousHash: string;
    }>;
    validateSequence(companyId: number, series: string, newNumber: number): Promise<boolean>;
    generateVerifactuJSON(invoice: Invoice): {
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
    };
}
