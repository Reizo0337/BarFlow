import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Get()
    @ApiOperation({ summary: 'Get all clients for the current company' })
    findAll(@Request() req) {
        return this.clientsService.findAll(req.user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get client details with invoice history' })
    findOne(@Param('id') id: string, @Request() req) {
        return this.clientsService.findOne(+id, req.user.companyId);
    }

    @Post()
    @ApiOperation({ summary: 'Add a new client' })
    create(@Body() data: any, @Request() req) {
        return this.clientsService.create(data, req.user.companyId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update client info' })
    update(@Param('id') id: string, @Body() data: any, @Request() req) {
        return this.clientsService.update(+id, data, req.user.companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a client' })
    remove(@Param('id') id: string, @Request() req) {
        return this.clientsService.remove(+id, req.user.companyId);
    }
}
