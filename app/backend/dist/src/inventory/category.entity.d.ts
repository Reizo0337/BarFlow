import { Company } from '../companies/company.entity';
import { Product } from './product.entity';
export declare class Category {
    id: number;
    name: string;
    company: Company;
    products: Product[];
}
