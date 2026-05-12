import { Controller, Get, Patch, Post, Body, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
    constructor(
        private readonly companiesService: CompaniesService,
    ) { }

    @Get('settings')
    async getSettings(@Request() req) {
        const company = await this.companiesService.findById(req.user.companyId);

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
        await this.companiesService.create({ id: req.user.companyId, ...body });
        return { success: true };
    }
}
