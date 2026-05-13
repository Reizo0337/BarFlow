import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
import { ColumnNumericTransformer } from '../common/numeric-transformer';

@Entity()
export class InvoiceItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productName: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    quantity: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    price: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    total: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
    invoice: Invoice;
}
