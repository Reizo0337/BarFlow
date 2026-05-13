import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';
export declare class AuditLogsService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    private calculateHash;
    log(user: User, company: Company, action: string, details: any, reason?: string): Promise<AuditLog>;
    findByCompany(companyId: number): Promise<AuditLog[]>;
}
