import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from '../user/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Fetch the profile of the user by their user ID
  async getProfileByUserId(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = user.profile;
    return {
      id: user.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: user.role,
      gender: profile.gender,
      dob: profile.dob.toISOString().split('T')[0], // Ensure dob is in yyyy-MM-dd format
      educationalLevel: profile.educationalLevel,
      phoneNumber: profile.phoneNumber,
      country: profile.country,
      city: profile.city,
    };
  }

  // Update profile of the current user
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = user.profile;
    Object.assign(profile, updateProfileDto);
    await this.profileRepository.save(profile);

    return profile;
  }
}
