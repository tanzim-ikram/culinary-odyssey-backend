import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard) // Protect the route with JWT Auth Guard
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // Endpoint to fetch logged-in user's profile
  @Get('me')
  async getProfile(@Request() req: any) {
    const userId = req.user.userId; // Extract user ID from the JWT payload
    return this.profileService.getProfileByUserId(userId); // Get the logged-in user's profile
  }

  // Endpoint to update the logged-in user's profile
  @Patch('me')
  async updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user.userId; // Extract user ID from the JWT payload
    return this.profileService.updateProfile(userId, updateProfileDto); // Update the logged-in user's profile
  }
}
