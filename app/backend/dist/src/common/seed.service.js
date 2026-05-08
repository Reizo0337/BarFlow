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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const inventory_service_1 = require("../inventory/inventory.service");
const invoices_service_1 = require("../invoices/invoices.service");
const companies_service_1 = require("../companies/companies.service");
let SeedService = class SeedService {
    usersService;
    inventoryService;
    invoicesService;
    companiesService;
    constructor(usersService, inventoryService, invoicesService, companiesService) {
        this.usersService = usersService;
        this.inventoryService = inventoryService;
        this.invoicesService = invoicesService;
        this.companiesService = companiesService;
    }
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
    async seedUsers(companyA) {
        console.log('Seeding users for company...');
        await this.usersService.create({ name: 'Admin Central', role: 'Administrador', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin1', pin: '1111' }, companyA.id);
    }
    async seedInventory(companyA) {
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
    async seedInvoices(companyA) {
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        inventory_service_1.InventoryService,
        invoices_service_1.InvoicesService,
        companies_service_1.CompaniesService])
], SeedService);
//# sourceMappingURL=seed.service.js.map