import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Company } from '../companies/company.entity';

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    timestamp: Date;

    @Column()
    action: string; // e.g., 'ORDER_CANCELLED', 'ITEM_REMOVED', 'PRICE_CHANGED'

    @Column({ type: 'text', nullable: true })
    details: string; // JSON string with cart items or modification details

    @Column({ nullable: true })
    reason: string;

    @Column({ nullable: true })
    previousHash: string;

    @Column({ nullable: true })
    hash: string;

    @ManyToOne(() => User)
    user: User;

    @Index()
    @ManyToOne(() => Company)
    company: Company;
}
