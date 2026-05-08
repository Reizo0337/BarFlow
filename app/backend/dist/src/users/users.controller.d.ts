import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<import("./user.entity").User[]>;
    findOne(id: string, req: any): Promise<import("./user.entity").User | null>;
    create(createUserDto: CreateUserDto, req: any): Promise<import("./user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("./user.entity").User | null>;
    remove(id: string): Promise<void>;
}
