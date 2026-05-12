import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    getSettings(req: any): Promise<{
        currency: string;
        legalName: string;
        nif: string;
        address: string;
        phone: string;
        vatRate: number;
        nextInvoiceNumber: number;
    }>;
    updateSettings(body: any, req: any): Promise<{
        success: boolean;
    }>;
}
