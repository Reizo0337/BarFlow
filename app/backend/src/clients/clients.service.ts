import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
    ) { }

    findAll(companyId: number) {
        return this.clientsRepository.find({
            where: { company: { id: companyId } },
            order: { name: 'ASC' }
        });
    }

    findOne(id: number, companyId: number) {
        return this.clientsRepository.findOne({
            where: { id, company: { id: companyId } },
            relations: ['invoices', 'invoices.items']
        });
    }

    create(data: Partial<Client>, companyId: number) {
        const client = this.clientsRepository.create({
            ...data,
            company: { id: companyId }
        });
        return this.clientsRepository.save(client);
    }

    async update(id: number, data: Partial<Client>, companyId: number) {
        if (Object.keys(data).length > 0) {
            await this.clientsRepository.update({ id, company: { id: companyId } }, data);
        }
        return this.findOne(id, companyId);
    }

    async remove(id: number, companyId: number) {
        await this.clientsRepository.delete({ id, company: { id: companyId } });
        return { deleted: true };
    }
}
