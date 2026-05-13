import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    companyCode: string; // Used for unique login identification

    @Column({ default: '€' })
    currency: string;

    @Column({ nullable: true })
    legalName: string;

    @Column({ nullable: true })
    nif: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
    vatRate: number;

    @Column({ type: 'bigint', default: 1, transformer: { to: (v) => v, from: (v) => parseInt(v) } })
    nextInvoiceNumber: number;

    @OneToMany(() => User, (user) => user.company)
    users: User[];
}
