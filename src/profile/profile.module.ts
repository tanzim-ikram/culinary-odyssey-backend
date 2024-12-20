import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User]),JwtModule], // Include Profile entity
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [TypeOrmModule], // Export TypeOrmModule to share ProfileRepository
})
export class ProfileModule {}