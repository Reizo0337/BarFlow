import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Company } from '../companies/company.entity';

import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    category: string;

    @Column('decimal', { 
        precision: 10, 
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    price: number;

    @Column()
    stock: number;

    @Column({ default: 0 })
    minStock: number;

    @Column({ default: 'unid' })
    unit: string;

    @Column({ nullable: true })
    image: string;

    @Index()
    @ManyToOne(() => Company)
    company: Company;
}
