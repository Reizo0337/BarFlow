import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Company } from '../companies/company.entity';

import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    invoiceNumber: string;

    @Column()
    type: 'in' | 'out';

    @Column()
    clientName: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    amount: number;

    @Column({ default: 'paid' })
    status: 'paid' | 'pending' | 'cancelled';

    @CreateDateColumn()
    createdAt: Date;

    @Index()
    @ManyToOne(() => Company)
    company: Company;
}
