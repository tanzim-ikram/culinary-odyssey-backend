import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async getProfileByUserId(userId: number): Promise<any> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } }, // Ensure the profile is fetched based on userId
      relations: ['user'], // Include related user information if needed
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    // Format response to exclude sensitive data like passwords
    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.user.role,
      gender: profile.gender,
      dob: profile.dob.toISOString().split('T')[0], // Format dob as "YYYY-MM-DD"
      educationalLevel: profile.educationalLevel,
      phoneNumber: profile.phoneNumber,
      country: profile.country,
      city: profile.city,
    };
  }

  async updateProfile(userId: number, updateProfileDto: any): Promise<any> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    Object.assign(profile, updateProfileDto);
    return this.profileRepository.save(profile);
  }
}
