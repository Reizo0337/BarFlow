import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import * as crypto from 'crypto';

@Injectable()
export class FiscalService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>
    ) {}

    /**
     * Calculates the SHA-256 hash for a fiscal record including the previous record's hash.
     * This creates the immutable "Hash Chain" required by Veri*factu.
     */
    async calculateChainedHash(invoice: Partial<Invoice>, companyId: number): Promise<{ hash: string, previousHash: string }> {
        // Get the latest invoice for this company and series to link the chain
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { 
                company: { id: companyId },
                series: invoice.series || 'A'
            },
            order: { createdAt: 'DESC', invoiceNumber: 'DESC' }
        });

        const previousHash = lastInvoice?.hash || '0'.repeat(64);
        
        // Data to be hashed (strictly defined by AEAT principles)
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

    /**
     * Validates that there are no gaps in the numbering sequence for a given series.
     */
    async validateSequence(companyId: number, series: string, newNumber: number): Promise<boolean> {
        const lastInvoice = await this.invoiceRepository.findOne({
            where: { company: { id: companyId }, series },
            order: { invoiceNumber: 'DESC' }
        });

        if (!lastInvoice) return true; // First invoice in series
        
        const lastNum = parseInt(lastInvoice.invoiceNumber);
        return newNumber === lastNum + 1;
    }

    /**
     * Generates a Veri*factu compliant JSON structure for AEAT submission.
     */
    generateVerifactuJSON(invoice: Invoice) {
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
                TipoFactura: "F1", // Factura ordinaria
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
}
