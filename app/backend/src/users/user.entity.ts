import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    role: string;

    @Column({ nullable: true })
    avatar: string;

    @Column()
    pin: string;

    @Index()
    @ManyToOne(() => Company, (company) => company.users)
    company: Company;
}
