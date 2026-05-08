import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Shift } from './shift.entity';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async startShift(userId: number, companyId: number): Promise<Shift> {
    const activeShift = await this.shiftsRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId }, isActive: true },
    });

    if (activeShift) {
      return activeShift;
    }

    const user = await this.usersRepository.findOneBy({ id: userId });
    const company = await this.companiesRepository.findOneBy({ id: companyId });

    if (!user || !company) {
      throw new NotFoundException('User or Company not found');
    }

    const shift = this.shiftsRepository.create({
      user,
      company,
      startTime: new Date(),
      isActive: true,
    });

    return this.shiftsRepository.save(shift);
  }

  async endShift(userId: number, companyId: number): Promise<Shift> {
    const activeShift = await this.shiftsRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId }, isActive: true },
    });

    if (!activeShift) {
      throw new NotFoundException('No active shift found');
    }

    activeShift.endTime = new Date();
    activeShift.isActive = false;

    return this.shiftsRepository.save(activeShift);
  }

  async getCurrentShift(userId: number, companyId: number): Promise<Shift | null> {
    return this.shiftsRepository.findOne({
      where: { user: { id: userId }, company: { id: companyId }, isActive: true },
    });
  }

  async getCompanyShifts(companyId: number): Promise<Shift[]> {
    return this.shiftsRepository.find({
      where: { company: { id: companyId } },
      relations: ['user'],
      order: { startTime: 'DESC' },
    });
  }

  async getUserDailyHours(userId: number): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const shifts = await this.shiftsRepository.find({
      where: { 
        user: { id: userId },
        startTime: MoreThanOrEqual(startOfToday)
      },
    });

    return shifts.reduce((total, shift) => {
      const end = shift.endTime || new Date();
      const duration = end.getTime() - shift.startTime.getTime();
      return total + duration;
    }, 0);
  }
}
