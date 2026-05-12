import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) { }

    async findAll(): Promise<Company[]> {
        return this.companyRepository.find();
    }

    async findByCode(companyCode: string): Promise<Company | null> {
        return this.companyRepository.findOne({ where: { companyCode } });
    }

    async create(data: Partial<Company>): Promise<Company> {
        const company = this.companyRepository.create(data);
        return this.companyRepository.save(company);
    }

    async findById(id: number): Promise<Company | null> {
        return this.companyRepository.findOne({ where: { id } });
    }
}
