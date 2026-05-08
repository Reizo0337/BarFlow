import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
export declare class Shift {
    id: number;
    user: User;
    company: Company;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
}
