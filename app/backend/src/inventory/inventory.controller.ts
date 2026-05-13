import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { FileService } from '../common/file.service';
import { memoryStorage } from 'multer';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly fileService: FileService
    ) { }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage() // Get in memory to process with sharp
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadFile(@UploadedFile() file: any) {
        const url = await this.fileService.processAndSaveImage(file.buffer, './uploads/products');
        return { url };
    }

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

    @Patch(':id/stock')
    updateStock(@Param('id') id: string, @Body() body: { delta: number }, @Request() req) {
        return this.inventoryService.updateStock(+id, body.delta, req.user.companyId);
    }

    @Post('categories')
    createCategory(@Body() body: { name: string }, @Request() req) {
        return this.inventoryService.createCategory(body.name, req.user.companyId);
    }

    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() body: { name: string }, @Request() req) {
        return this.inventoryService.updateCategory(+id, body.name, req.user.companyId);
    }

    @Delete('categories/:id')
    removeCategory(@Param('id') id: string, @Request() req) {
        return this.inventoryService.removeCategory(+id, req.user.companyId);
    }

    @Post('apply-template')
    applyTemplate(@Body() template: any[], @Request() req) {
        return this.inventoryService.applyTemplate(template, req.user.companyId);
    }
}
