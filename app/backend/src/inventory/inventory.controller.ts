import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    findAll(@Request() req) {
        return this.inventoryService.findAll(req.user.companyId);
    }

    @Get('categories')
    findAllCategories(@Request() req) {
        return this.inventoryService.findAllCategories(req.user.companyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.inventoryService.findOne(+id, req.user.companyId);
    }

    @Post()
    create(@Body() createProductDto: CreateProductDto, @Request() req) {
        return this.inventoryService.create(createProductDto, req.user.companyId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
        return this.inventoryService.update(+id, updateProductDto, req.user.companyId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.inventoryService.remove(+id, req.user.companyId);
    }
}
