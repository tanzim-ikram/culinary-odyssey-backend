import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Fetch user's profile based on user ID
  async getUserProfile(userId: number): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'gender',
        'dob',
        'educationalLevel',
        'phoneNumber',
        'country',
        'city',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transform DOB to 'YYYY-MM-DD'
    const formattedUser: ProfileResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : null, // Format date
      educationalLevel: user.educationalLevel,
      phoneNumber: user.phoneNumber,
      country: user.country,
      city: user.city,
    };

    return formattedUser;
  }
}
