import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class DailyClosing {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    closingNumber: number; // Sequential Z number

    @Column()
    firstInvoiceNumber: string;

    @Column()
    lastInvoiceNumber: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    totalAmount: number;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    totalVat: number;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 0
    })
    expectedCash: number;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 0
    })
    actualCash: number;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        default: 0
    })
    expectedCard: number;

    @Column({ default: 0 })
    totalSalesCount: number;

    @Column({ type: 'text', nullable: true })
    vatBreakdown: string; // JSON with different rates totals

    @Column({ type: 'text', nullable: true })
    itemizedSales: string; // JSON with product-total breakdown

    @ManyToOne(() => User)
    user: User; // Who did the closing

    @Index()
    @ManyToOne(() => Company)
    company: Company;
}
