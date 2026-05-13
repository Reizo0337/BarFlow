import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    findAllByCompanyId(companyId: number): Promise<User[]> {
        return this.usersRepository.find({
            where: { company: { id: companyId } },
            relations: ['company']
        });
    }

    findOneFiltered(id: number, companyId: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['company']
        });
    }

    findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id }, relations: ['company'] });
    }

    async findByPinAndCompany(pin: string, companyCode: string): Promise<User | null> {
        console.log(`Attempting login for company: ${companyCode}, pin: ${pin}`);
        // We find the user by company first
        const users = await this.usersRepository.find({
            where: { company: { companyCode: companyCode } },
            relations: ['company']
        });

        console.log(`Found ${users.length} users for this company`);

        // Search for the pin in the filtered list (checking hash)
        for (const user of users) {
            const isMatch = await bcrypt.compare(pin, user.pin).catch(() => false);
            const isPlainMatch = pin === user.pin; // Temporary fallback for unhashed seed data
            
            console.log(`Checking user: ${user.name}, hashed match: ${isMatch}, plain match: ${isPlainMatch}`);
            
            if (isMatch || isPlainMatch) {
                return user;
            }
        }
        return null;
    }

    async create(createUserDto: CreateUserDto, companyId: number): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.pin, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            pin: hashedPassword,
            company: { id: companyId } as any
        });
        return this.usersRepository.save(user);
    }

    async update(id: number, updateUserDto: UpdateUserDto, companyId: number): Promise<User | null> {
        const user = await this.findOneFiltered(id, companyId);
        if (!user) return null;

        const data: any = { ...updateUserDto };
        if (data.pin) {
            data.pin = await bcrypt.hash(data.pin, 10);
        }

        if (Object.keys(data).length > 0) {
            await this.usersRepository.update(id, data);
        }
        return this.findOneFiltered(id, companyId);
    }

    async remove(id: number, companyId: number): Promise<void> {
        const user = await this.findOneFiltered(id, companyId);
        if (user) {
            await this.usersRepository.delete(id);
        }
    }
}
