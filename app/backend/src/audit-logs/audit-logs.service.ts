import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';

import * as crypto from 'crypto';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) {}

    private calculateHash(data: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    async log(user: User, company: Company, action: string, details: any, reason?: string) {
        // 1. Find previous log for this company to get its hash
        const lastLog = await this.auditLogRepository.findOne({
            where: { company: { id: company.id } },
            order: { timestamp: 'DESC' }
        });

        const previousHash = lastLog ? lastLog.hash : '0'.repeat(64);

        // 2. Prepare data for hashing
        const entryData = {
            timestamp: new Date().toISOString(),
            action,
            details,
            reason,
            previousHash,
            userId: user.id,
            companyId: company.id
        };

        const hash = this.calculateHash(entryData);

        const entry = this.auditLogRepository.create({
            user,
            company,
            action,
            details: JSON.stringify(details),
            reason,
            previousHash,
            hash
        });
        return await this.auditLogRepository.save(entry);
    }

    async findByCompany(companyId: number) {
        return await this.auditLogRepository.find({
            where: { company: { id: companyId } },
            relations: ['user'],
            order: { timestamp: 'DESC' }
        });
    }
}
