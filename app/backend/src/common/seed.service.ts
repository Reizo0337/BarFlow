import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InventoryService } from '../inventory/inventory.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        private readonly usersService: UsersService,
        private readonly inventoryService: InventoryService,
        private readonly invoicesService: InvoicesService,
        private readonly companiesService: CompaniesService,
    ) { }

    async onApplicationBootstrap() {
        let companies = await this.companiesService.findAll();
        if (companies.length === 0) {
            console.log('Seeding SaaS companies...');
            await this.companiesService.create({ name: 'Bar Central', companyCode: 'BCENTRAL' });
            companies = await this.companiesService.findAll();
        }

        const companyA = companies.find(c => c.companyCode === 'BCENTRAL');

        if (companyA) {
            const users = await this.usersService.findAllByCompanyId(companyA.id);
            if (users.length === 0) {
                await this.seedUsers(companyA);
            }
        }
    }

    private async seedUsers(companyA: any) {
        console.log('Seeding users for company...');
        await this.usersService.create({ name: 'Admin Central', role: 'Administrador', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin1', pin: '1111' }, companyA.id);
    }
}
