import { User } from '../users/user.entity';
export declare class Company {
    id: number;
    name: string;
    companyCode: string;
    users: User[];
}
