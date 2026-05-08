import { Company } from '../companies/company.entity';
export declare class Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
    image: string;
    company: Company;
}
