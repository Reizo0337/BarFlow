import { Company } from '../companies/company.entity';
export declare class TableOrder {
    id: number;
    tableNumber: string;
    cartData: string;
    total: number;
    lastUpdated: Date;
    company: Company;
}
