import { Controller, Get, Patch, Body, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
    constructor(
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) {}

    @Get('settings')
    async getSettings(@Request() req) {
        const company = await this.companyRepository.findOne({
            where: { id: req.user.companyId }
        });
        
        if (!company) {
            throw new NotFoundException('Company settings not found');
        }

        return {
            currency: company.currency,
            legalName: company.legalName,
            nif: company.nif,
            address: company.address,
            phone: company.phone,
            vatRate: company.vatRate,
            nextInvoiceNumber: company.nextInvoiceNumber
        };
    }

    @Patch('settings')
    async updateSettings(@Body() body: any, @Request() req) {
        await this.companyRepository.update(req.user.companyId, body);
        return { success: true };
    }
}
