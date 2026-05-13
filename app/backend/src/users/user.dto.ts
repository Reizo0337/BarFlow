import { IsString, IsOptional, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    role: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsNotEmpty()
    pin: string;

    @IsNumber()
    @IsOptional()
    contractedHours?: number;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    pin?: string;

    @IsNumber()
    @IsOptional()
    contractedHours?: number;
}
