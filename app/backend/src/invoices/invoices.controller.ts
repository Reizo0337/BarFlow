import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { FiscalService } from '../fiscal/fiscal.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly fiscalService: FiscalService
    ) { }

    @Get('daily-closing/stats')
    @ApiOperation({ summary: 'Get current stats for the daily closing' })
    getClosingStats(@Request() req) {
        return this.invoicesService.getClosingStats(req.user.companyId);
    }

    @Get('daily-closing/history')
    @ApiOperation({ summary: 'Get history of Z-reports' })
    getClosingHistory(@Request() req) {
        return this.invoicesService.getClosingHistory(req.user.companyId);
    }

    @Post('daily-closing')
    @ApiOperation({ summary: 'Perform a daily Z-report closing (Law Compliance)' })
    performDailyClosing(@Request() req, @Body() body: { actualCash: number }) {
        return this.invoicesService.performDailyClosing(req.user.companyId, req.user, body.actualCash);
    }

    @Get()
    @ApiOperation({ summary: 'Get all invoices' })
    findAll(@Request() req) {
        return this.invoicesService.findAll(req.user.companyId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new invoice (Fiscal Record)' })
    create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
        return this.invoicesService.create(createInvoiceDto, req.user.companyId, req.user);
    }

    @Get(':id/verifactu')
    @ApiOperation({ summary: 'Get Veri*factu compliant JSON for an invoice' })
    async getVerifactuJSON(@Param('id') id: string, @Request() req) {
        const invoice = await this.invoicesService.findOne(+id, req.user.companyId);
        if (!invoice) throw new Error('Invoice not found');
        return this.fiscalService.generateVerifactuJSON(invoice);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get one invoice' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.invoicesService.findOne(+id, req.user.companyId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an invoice (Restricted by Law 11/2021)' })
    update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
        return this.invoicesService.update(+id, updateInvoiceDto, req.user.companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an invoice (Forbidden by Law 11/2021)' })
    remove(@Param('id') id: string, @Request() req) {
        return this.invoicesService.remove(+id, req.user.companyId);
    }
}
