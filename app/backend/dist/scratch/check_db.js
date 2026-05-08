"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../src/users/user.entity");
const company_entity_1 = require("../src/companies/company.entity");
const product_entity_1 = require("../src/inventory/product.entity");
const invoice_entity_1 = require("../src/invoices/invoice.entity");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../.env') });
async function checkDb() {
    const connection = await (0, typeorm_1.createConnection)({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [user_entity_1.User, company_entity_1.Company, product_entity_1.Product, invoice_entity_1.Invoice],
        synchronize: false,
    });
    const companies = await connection.getRepository(company_entity_1.Company).find();
    console.log('Companies:', companies.map(c => ({ id: c.id, code: c.companyCode, name: c.name })));
    const users = await connection.getRepository(user_entity_1.User).find({ relations: ['company'] });
    console.log('Users:', users.map(u => ({ id: u.id, name: u.name, company: u.company?.companyCode })));
    const products = await connection.getRepository(product_entity_1.Product).find({ relations: ['company'] });
    console.log('Products:', products.map(p => ({ id: p.id, name: p.name, company: p.company?.companyCode })));
    const invoices = await connection.getRepository(invoice_entity_1.Invoice).find({ relations: ['company'] });
    console.log('Invoices:', invoices.map(i => ({ id: i.id, num: i.invoiceNumber, company: i.company?.companyCode })));
    await connection.close();
}
checkDb().catch(console.error);
//# sourceMappingURL=check_db.js.map