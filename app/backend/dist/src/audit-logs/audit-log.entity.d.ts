import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
export declare class AuditLog {
    id: number;
    timestamp: Date;
    action: string;
    details: string;
    reason: string;
    previousHash: string;
    hash: string;
    user: User;
    company: Company;
}
