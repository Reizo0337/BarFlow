import { User } from '../users/user.entity';
export declare class Company {
    id: number;
    name: string;
    companyCode: string;
    currency: string;
    legalName: string;
    nif: string;
    address: string;
    phone: string;
    vatRate: number;
    nextInvoiceNumber: number;
    users: User[];
}
