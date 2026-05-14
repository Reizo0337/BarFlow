import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) { }

  @Post('start')
  async startShift(@Req() req) {
    return this.shiftsService.startShift(req.user.userId, req.user.companyId);
  }

  @Post('end')
  async endShift(@Req() req) {
    return this.shiftsService.endShift(req.user.userId, req.user.companyId);
  }

  @Get('current')
  async getCurrentShift(@Req() req) {
    return this.shiftsService.getCurrentShift(req.user.userId, req.user.companyId);
  }

  @Get('company')
  async getCompanyShifts(@Req() req) {
    return this.shiftsService.getCompanyShifts(req.user.companyId);
  }

  @Get('daily-hours')
  async getDailyHours(@Req() req) {
    return this.shiftsService.getUserDailyHours(req.user.userId);
  }

  @Patch(':id')
  async updateShift(@Req() req, @Body() body, @Param('id') id: string) {
    return this.shiftsService.updateShift(+id, body, req.user.companyId, req.user.username || 'Admin');
  }
}
