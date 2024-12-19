import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SignInDto } from '../auth/dto/signin.dto';
import { Request, Response } from 'express';

// auth controller
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // sign up controller
  @Post('signup')
  async signUp(@Body() authDto: AuthDto) {
    // Signup logic does not need token validation
    return this.authService.signUp(authDto);
  }

  // sign in controller
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {  // Add @Res()
    return this.authService.signIn(signInDto, res);  // Pass res here
  }

  @Post('logout')
  async signOut(@Req() req: Request, @Res() res: Response): Promise<any> {
    // Optional: Perform server-side logic like deleting session, etc.
    res.clearCookie('access_token');  // This assumes you're storing JWT in cookies
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}