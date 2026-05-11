import { Repository } from 'typeorm';
import { Company } from './company.entity';
export declare class CompaniesController {
    private companyRepository;
    constructor(companyRepository: Repository<Company>);
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
