import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity'; // Assuming User entity exists

export enum Status {
    PENDING = 'PENDING',
    DELIVERED = 'DELIVERED',
    IN_PROCESS = 'IN PROCESS',
    FAILED = 'FAILED'
  }

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  parcelId: string;

  @Column()
  address: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: Status })
  deliveryStatus: Status;

  @ManyToOne(() => User, (user) => user.orders)
  user: User; // Associate with the User entity
}
