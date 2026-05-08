import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginSaaSDto } from './dto/login-saas.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login-saas')
    async loginSaaS(
        @Body() loginDto: LoginSaaSDto
    ) {
        const user = await this.authService.validateSaaSUser(loginDto.companyCode, loginDto.pin);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas para esta empresa');
        }
        return this.authService.login(user);
    }
}
