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
        }
    }
    async seedUsers(companyA) {
        console.log('Seeding users for company...');
        await this.usersService.create({ name: 'Admin Central', role: 'Administrador', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin1', pin: '1111' }, companyA.id);
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