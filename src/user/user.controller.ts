import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard)  // Protect this route with AuthGuard
  @Get()
  getUserProfile(@Req() req) {
    return req.user;  // The authenticated user info will be available here
  }
}

@Controller('user')
export class UserController {
  // Controller logic here
}
