import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAllByCompanyId(companyId: number): Promise<User[]>;
    findOneFiltered(id: number, companyId: number): Promise<User | null>;
    findOne(id: number): Promise<User | null>;
    findByPinAndCompany(pin: string, companyCode: string): Promise<User | null>;
    create(createUserDto: CreateUserDto, companyId: number): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User | null>;
    remove(id: number): Promise<void>;
}
