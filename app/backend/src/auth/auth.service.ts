import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateSaaSUser(companyCode: string, pin: string): Promise<any> {
        const user = await this.usersService.findByPinAndCompany(pin, companyCode);
        if (user) {
            const { pin, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { 
            username: user.name, 
            sub: user.id, 
            companyId: user.company.id,
            companyCode: user.company.companyCode,
            role: user.role 
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }
}
