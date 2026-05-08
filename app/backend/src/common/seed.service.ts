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

            const products = await this.inventoryService.findAll(companyA.id);
            if (products.length < 4) {
                await this.seedInventory(companyA);
            }

            const invoices = await this.invoicesService.findAll(companyA.id);
            if (invoices.length < 2) {
                await this.seedInvoices(companyA);
            }
        }
    }

    private async seedUsers(companyA: any) {
        console.log('Seeding users for company...');
        await this.usersService.create({ name: 'Admin Central', role: 'Administrador', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin1', pin: '1111' }, companyA.id);
    }

    private async seedInventory(companyA: any) {
        console.log('Seeding inventory for company...');
        const productsA = [
            { name: 'Cerveza Artesana', category: 'drinks', stock: 100, unit: 'unid', minStock: 20, price: 4.5, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=300&h=300&fit=crop' },
            { name: 'Café Con Leche', category: 'coffee', stock: 50, unit: 'unid', minStock: 10, price: 2.2, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=300&h=300&fit=crop' },
            { name: 'Hamburguesa BarFlow', category: 'food', stock: 30, unit: 'unid', minStock: 5, price: 12.5, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop' },
            { name: 'Coca Cola', category: 'drinks', stock: 100, unit: 'unid', minStock: 20, price: 2.5, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop' },
        ];

        for (const p of productsA) {
            await this.inventoryService.create(p, companyA.id);
        }
    }

    private async seedInvoices(companyA: any) {
        console.log('Seeding invoices for company...');
        await this.invoicesService.create({ 
            invoiceNumber: 'BC-001', 
            type: 'out', 
            clientName: 'Consumidor Final', 
            amount: 45.5, 
            status: 'paid' 
        }, companyA.id);
        
        await this.invoicesService.create({ 
            invoiceNumber: 'BC-002', 
            type: 'in', 
            clientName: 'Proveedor Bebidas', 
            amount: 150.0, 
            status: 'paid' 
        }, companyA.id);
    }
}
