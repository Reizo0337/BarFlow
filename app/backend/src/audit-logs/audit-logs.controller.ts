import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Post()
    @ApiOperation({ summary: 'Create an audit log entry (Law Compliance)' })
    async createLog(@Request() req, @Body() body: { action: string, details: any, reason?: string }) {
        return await this.auditLogsService.log(
            { id: req.user.userId || req.user.id } as any,
            { id: req.user.companyId } as any,
            body.action,
            body.details,
            body.reason
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all logs for the current company' })
    async getLogs(@Request() req) {
        return await this.auditLogsService.findByCompany(req.user.companyId);
    }
}
