import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum shoppingStatus {
  PENDING = 'PENDING',
  BOUGHT = 'BOUGHT',
}

@Entity('shoppinglist')
export class ShoppingList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'enum', enum: shoppingStatus, default: shoppingStatus.PENDING })
  status: shoppingStatus;

  @ManyToOne(() => User, (user) => user.shoppingLists, { onDelete: 'CASCADE', eager: true })
  user: User;
}
