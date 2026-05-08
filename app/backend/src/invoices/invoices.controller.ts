import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll(@Request() req) {
        return this.invoicesService.findAll(req.user.companyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.invoicesService.findOne(+id, req.user.companyId);
    }

    @Post()
    create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
        return this.invoicesService.create(createInvoiceDto, req.user.companyId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
        return this.invoicesService.update(+id, updateInvoiceDto, req.user.companyId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.invoicesService.remove(+id, req.user.companyId);
    }
}
