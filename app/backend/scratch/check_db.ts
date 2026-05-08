import { createConnection } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Company } from '../src/companies/company.entity';
import { Product } from '../src/inventory/product.entity';
import { Invoice } from '../src/invoices/invoice.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDb() {
    const connection = await createConnection({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [User, Company, Product, Invoice],
        synchronize: false,
    });

    const companies = await connection.getRepository(Company).find();
    console.log('Companies:', companies.map(c => ({ id: c.id, code: c.companyCode, name: c.name })));

    const users = await connection.getRepository(User).find({ relations: ['company'] });
    console.log('Users:', users.map(u => ({ id: u.id, name: u.name, company: u.company?.companyCode })));

    const products = await connection.getRepository(Product).find({ relations: ['company'] });
    console.log('Products:', products.map(p => ({ id: p.id, name: p.name, company: p.company?.companyCode })));

    const invoices = await connection.getRepository(Invoice).find({ relations: ['company'] });
    console.log('Invoices:', invoices.map(i => ({ id: i.id, num: i.invoiceNumber, company: i.company?.companyCode })));

    await connection.close();
}

checkDb().catch(console.error);
