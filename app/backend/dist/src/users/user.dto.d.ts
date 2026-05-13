export declare class CreateUserDto {
    name: string;
    role: string;
    avatar?: string;
    pin: string;
    contractedHours?: number;
}
export declare class UpdateUserDto {
    name?: string;
    role?: string;
    avatar?: string;
    pin?: string;
    contractedHours?: number;
}
