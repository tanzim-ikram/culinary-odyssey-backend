import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';  // JWT protection
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Request as ExpressRequest } from 'express';  // Correct import for express request
import { User } from '../user/entities/user.entity';  // Import User entity

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)  // Protect the route with JWT guard
  async getProfile(@Request() req: ExpressRequest) {
    const user = req.user as User;  // Explicitly cast req.user as User
    return this.profileService.getProfileByUserId(user.id);  // Now TypeScript knows user has an 'id'
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)  // Protect the route with JWT guard
  async updateProfile(@Request() req: ExpressRequest, @Body() updateProfileDto: UpdateProfileDto) {
    const user = req.user as User;  // Explicitly cast req.user as User
    return this.profileService.updateProfile(user.id, updateProfileDto);  // Now TypeScript knows user has an 'id'
  }
}
