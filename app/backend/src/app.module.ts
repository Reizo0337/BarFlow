import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { InventoryModule } from './inventory/inventory.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SeedService } from './common/seed.service';
import { CompaniesModule } from './companies/companies.module';
import { AuthModule } from './auth/auth.module';
import { ShiftsModule } from './shifts/shifts.module';
import { TablesModule } from './tables/tables.module';
import { AiModule } from './ai/ai.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DATABASE_SYNC'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    InventoryModule,
    InvoicesModule,
    CompaniesModule,
    ShiftsModule,
    TablesModule,
    AiModule,
    AuditLogsModule,
    FiscalModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule { }
