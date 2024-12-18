import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'DeliveryMan' }) // Default role is DeliveryMan
  role: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  gender: string;

  @Column()
  dob: Date;

  @Column()
  educationalLevel: string;

  @Column()
  phoneNumber: string;

  @Column()
  country: string;

  @Column()
  city: string;
}
