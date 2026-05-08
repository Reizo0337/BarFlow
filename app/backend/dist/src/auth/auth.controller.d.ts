import { AuthService } from './auth.service';
import { LoginSaaSDto } from './dto/login-saas.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    loginSaaS(loginDto: LoginSaaSDto): Promise<{
        access_token: string;
        user: any;
    }>;
}
