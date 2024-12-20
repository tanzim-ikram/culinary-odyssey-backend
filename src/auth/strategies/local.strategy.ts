// src/auth/strategies/local.strategy.ts
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
// import { UnauthorizedException } from '@nestjs/common';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use 'email' for login
  }

  // Override the validate method to use validateUser from AuthService
  async validate(email: string, password: string): Promise<any> {
    return this.authService.validateUser(email, password); // Call the validateUser method
  }
}