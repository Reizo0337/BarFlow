import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Invoice } from '../invoices/invoice.entity';

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // Legal name or commercial name

    @Column()
    fiscalId: string; // NIF/CIF/NIE (Required)

    @Column()
    phone: string; // Required

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    postalCode: string;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Company)
    company: Company;

    @OneToMany(() => Invoice, (invoice) => invoice.client)
    invoices: Invoice[];
}
