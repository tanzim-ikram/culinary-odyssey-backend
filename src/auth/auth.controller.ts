import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SignInDto } from './dto/signin.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Sign-Up Controller
  @Post('signup')
  async signUp(@Body() authDto: AuthDto) {
    return this.authService.signUp(authDto);
  }

  // Sign-In Controller
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    return this.authService.signIn(signInDto, res);
  }

  // Logout Controller
  @Post('logout')
  async signOut(@Req() req: Request, @Res() res: Response): Promise<any> {
    // Optional: Perform server-side logic like deleting session, etc.
    res.clearCookie('access_token');  // This assumes you're storing JWT in cookies
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}
