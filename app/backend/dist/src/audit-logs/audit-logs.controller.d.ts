import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    createLog(req: any, body: {
        action: string;
        details: any;
        reason?: string;
    }): Promise<import("./audit-log.entity").AuditLog>;
    getLogs(req: any): Promise<import("./audit-log.entity").AuditLog[]>;
}
