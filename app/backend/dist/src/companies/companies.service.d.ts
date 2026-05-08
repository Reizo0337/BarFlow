import { Repository } from 'typeorm';
import { Company } from './company.entity';
export declare class CompaniesService {
    private companyRepository;
    constructor(companyRepository: Repository<Company>);
    findAll(): Promise<Company[]>;
    findByCode(companyCode: string): Promise<Company | null>;
    create(data: Partial<Company>): Promise<Company>;
}
