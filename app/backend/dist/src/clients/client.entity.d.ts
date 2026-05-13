import { Company } from '../companies/company.entity';
import { Invoice } from '../invoices/invoice.entity';
export declare class Client {
    id: number;
    name: string;
    fiscalId: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    notes: string;
    createdAt: Date;
    company: Company;
    invoices: Invoice[];
}
