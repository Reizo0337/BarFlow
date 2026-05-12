import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('command')
    async handleCommand(@Body() body: { text: string, history?: any[] }, @Request() req) {
        return this.aiService.processCommand(body.text, req.user.companyId, body.history);
    }
}
