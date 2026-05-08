import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function resetDB() {
    console.log('Connecting to database...');
    const connection = await createConnection({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'reizonr1',
        database: 'barflow_db',
        entities: [join(__dirname, '../src/**/*.entity.ts')],
        synchronize: true,
        dropSchema: true,
    });

    console.log('Database dropped and synchronized. Restart the backend to seed.');
    await connection.close();
}

resetDB().catch(err => console.error(err));
