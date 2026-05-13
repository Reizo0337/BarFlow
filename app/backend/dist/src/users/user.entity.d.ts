import { Company } from '../companies/company.entity';
export declare class User {
    id: number;
    name: string;
    role: string;
    avatar: string;
    pin: string;
    contractedHours: number;
    company: Company;
}
