import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Company } from '../companies/company.entity';
import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class TableOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tableNumber: string;

    @Column('longtext')
    cartData: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    total: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;

    @Index()
    @ManyToOne(() => Company)
    company: Company;
}
