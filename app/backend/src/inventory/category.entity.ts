import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Product } from './product.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Index()
    @ManyToOne(() => Company)
    company: Company;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
