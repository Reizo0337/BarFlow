import { Repository } from 'typeorm';
import { Shift } from './shift.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
export declare class ShiftsService {
    private shiftsRepository;
    private usersRepository;
    private companiesRepository;
    constructor(shiftsRepository: Repository<Shift>, usersRepository: Repository<User>, companiesRepository: Repository<Company>);
    startShift(userId: number, companyId: number): Promise<Shift>;
    endShift(userId: number, companyId: number): Promise<Shift>;
    getCurrentShift(userId: number, companyId: number): Promise<Shift | null>;
    getCompanyShifts(companyId: number): Promise<Shift[]>;
    getUserDailyHours(userId: number): Promise<number>;
    updateShift(id: number, data: any, companyId: number, adminName: string): Promise<Shift>;
}
