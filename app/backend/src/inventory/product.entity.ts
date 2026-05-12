import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Category } from './category.entity';
import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

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
