import { Controller, Get, Post, Body, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
    constructor(private readonly tablesService: TablesService) {}

    @Get()
    getPendingOrders(@Request() req) {
        return this.tablesService.getPendingOrders(req.user.companyId);
    }

    @Post()
    saveOrder(@Request() req, @Body() body: { tableNumber: string, cartData: any, total: number }) {
        return this.tablesService.saveOrder(
            body.tableNumber, 
            JSON.stringify(body.cartData), 
            body.total, 
            req.user.companyId
        );
    }

    @Delete(':tableNumber')
    deleteOrder(@Request() req, @Param('tableNumber') tableNumber: string) {
        return this.tablesService.deleteOrder(tableNumber, req.user.companyId);
    }
}
