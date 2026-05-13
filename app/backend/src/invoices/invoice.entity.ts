import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { Company } from '../companies/company.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Client } from '../clients/client.entity';

import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    invoiceNumber: string;

    @Column()
    type: 'in' | 'out' | 'sale' | 'purchase';

    @Column()
    clientName: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    amount: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 0
    })
    taxableBase: number;

    @Column('decimal', {
        precision: 5,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 10
    })
    vatRate: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 0
    })
    vatAmount: number;

    @Column({ default: 'A' })
    series: string; // e.g., 'A' for sales, 'R' for rectificativas

    @Column({ default: 'T01' })
    terminalId: string; // ID of the POS terminal

    @Column({ default: 'normal' })
    fiscalStatus: 'normal' | 'rectificative' | 'cancelled';

    @Column({ default: false })
    aeatSent: boolean;

    @Column({ type: 'timestamp', nullable: true })
    aeatSentAt: Date;

    @Column({ nullable: true })
    paymentMethod: string;

    @Column({ nullable: true })
    previousHash: string;

    @Column({ nullable: true })
    hash: string;

    @CreateDateColumn()
    createdAt: Date;

    @Index()
    @ManyToOne(() => Company)
    company: Company;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items: InvoiceItem[];

    @ManyToOne(() => Client, (client) => client.invoices, { nullable: true })
    client: Client;
}
