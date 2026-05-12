import { Company } from '../companies/company.entity';
import { Category } from './category.entity';
export declare class Product {
    id: number;
    name: string;
    category: Category;
    price: number;
    stock: number;
    minStock: number;
    unit: string;
    image: string;
    company: Company;
}
