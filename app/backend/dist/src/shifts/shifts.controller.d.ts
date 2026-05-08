import { ShiftsService } from './shifts.service';
export declare class ShiftsController {
    private readonly shiftsService;
    constructor(shiftsService: ShiftsService);
    startShift(req: any): Promise<import("./shift.entity").Shift>;
    endShift(req: any): Promise<import("./shift.entity").Shift>;
    getCurrentShift(req: any): Promise<import("./shift.entity").Shift | null>;
    getCompanyShifts(req: any): Promise<import("./shift.entity").Shift[]>;
    getDailyHours(req: any): Promise<number>;
}
