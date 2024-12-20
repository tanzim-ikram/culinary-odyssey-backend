import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';

@Entity('users') // Table name
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'DeliveryMan' }) // Default role
  role: string;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  // Track user's last login
  @Column({ nullable: true })
  lastLogin: Date;

  // Track user's last logout
  @Column({ nullable: true })
  lastLogout: Date;

  @CreateDateColumn()
  createdAt: Date; // Automatically set on insert

  @UpdateDateColumn()
  updatedAt: Date; // Automatically updated on save
}
