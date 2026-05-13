import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    findAll(req: any): Promise<import("./client.entity").Client[]>;
    findOne(id: string, req: any): Promise<import("./client.entity").Client | null>;
    create(data: any, req: any): Promise<import("./client.entity").Client>;
    update(id: string, data: any, req: any): Promise<import("./client.entity").Client | null>;
    remove(id: string, req: any): Promise<{
        deleted: boolean;
    }>;
}
