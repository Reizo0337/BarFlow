import { IsString, IsNotEmpty } from 'class-validator';

export class LoginSaaSDto {
    @IsString()
    @IsNotEmpty()
    companyCode: string;

    @IsString()
    @IsNotEmpty()
    pin: string;
}
