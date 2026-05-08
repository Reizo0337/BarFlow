import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'BARFLOW_SUPER_SECRET_KEY', // In production use process.env.JWT_SECRET
        });
    }

    async validate(payload: any) {
        return { 
            userId: payload.sub, 
            username: payload.username, 
            companyId: payload.companyId,
            companyCode: payload.companyCode,
            role: payload.role 
        };
    }
}
