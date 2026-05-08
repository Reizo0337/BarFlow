import { OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InventoryService } from '../inventory/inventory.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CompaniesService } from '../companies/companies.service';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly usersService;
    private readonly inventoryService;
    private readonly invoicesService;
    private readonly companiesService;
    constructor(usersService: UsersService, inventoryService: InventoryService, invoicesService: InvoicesService, companiesService: CompaniesService);
    onApplicationBootstrap(): Promise<void>;
    private seedUsers;
    private seedInventory;
    private seedInvoices;
}
