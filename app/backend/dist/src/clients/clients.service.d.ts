import { Repository } from 'typeorm';
import { Client } from './client.entity';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    findAll(companyId: number): Promise<Client[]>;
    findOne(id: number, companyId: number): Promise<Client | null>;
    create(data: Partial<Client>, companyId: number): Promise<Client>;
    update(id: number, data: Partial<Client>, companyId: number): Promise<Client | null>;
    remove(id: number, companyId: number): Promise<{
        deleted: boolean;
    }>;
}
