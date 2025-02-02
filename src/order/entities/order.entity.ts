import { User } from '../../user/entities/user.entity'; // Assuming User entity exists
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum Status {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  IN_PROCESS = 'IN PROCESS',
  FAILED = 'FAILED'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn() // Auto-increment ID
  id: number;

  @Column()
  customerName: string;

  @Column()
  parcelId: string;

  @Column()
  address: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  deliveryStatus: Status;

  @CreateDateColumn({ type: 'timestamp' }) // Auto-set creation date
  orderCreated: Date;

  @ManyToOne(() => User, (user) => user.orders, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // Auto-associate the logged-in user
  user: User;
}
