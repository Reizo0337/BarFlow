"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shift_entity_1 = require("./shift.entity");
const user_entity_1 = require("../users/user.entity");
const company_entity_1 = require("../companies/company.entity");
let ShiftsService = class ShiftsService {
    shiftsRepository;
    usersRepository;
    companiesRepository;
    constructor(shiftsRepository, usersRepository, companiesRepository) {
        this.shiftsRepository = shiftsRepository;
        this.usersRepository = usersRepository;
        this.companiesRepository = companiesRepository;
    }
    async startShift(userId, companyId) {
        const activeShift = await this.shiftsRepository.findOne({
            where: { user: { id: userId }, company: { id: companyId }, isActive: true },
        });
        if (activeShift) {
            return activeShift;
        }
        const user = await this.usersRepository.findOneBy({ id: userId });
        const company = await this.companiesRepository.findOneBy({ id: companyId });
        if (!user || !company) {
            throw new common_1.NotFoundException('User or Company not found');
        }
        const shift = this.shiftsRepository.create({
            user,
            company,
            startTime: new Date(),
            isActive: true,
        });
        return this.shiftsRepository.save(shift);
    }
    async endShift(userId, companyId) {
        const activeShift = await this.shiftsRepository.findOne({
            where: { user: { id: userId }, company: { id: companyId }, isActive: true },
        });
        if (!activeShift) {
            throw new common_1.NotFoundException('No active shift found');
        }
        activeShift.endTime = new Date();
        activeShift.isActive = false;
        return this.shiftsRepository.save(activeShift);
    }
    async getCurrentShift(userId, companyId) {
        return this.shiftsRepository.findOne({
            where: { user: { id: userId }, company: { id: companyId }, isActive: true },
        });
    }
    async getCompanyShifts(companyId) {
        return this.shiftsRepository.find({
            where: { company: { id: companyId } },
            relations: ['user'],
            order: { startTime: 'DESC' },
        });
    }
    async getUserDailyHours(userId) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const shifts = await this.shiftsRepository.find({
            where: {
                user: { id: userId },
                startTime: (0, typeorm_2.MoreThanOrEqual)(startOfToday)
            },
        });
        return shifts.reduce((total, shift) => {
            const end = shift.endTime || new Date();
            const duration = end.getTime() - shift.startTime.getTime();
            return total + duration;
        }, 0);
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map