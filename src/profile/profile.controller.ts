import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  // Protect Route using JWT Auth Guard
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@Req() req: any) {
    const userId = req.user.userId; // userId is available from validated JWT payload
    return this.userService.getUserProfile(userId);
  }
}
