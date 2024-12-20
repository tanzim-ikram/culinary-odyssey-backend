import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'] || null;

    if (!token) {
      return false;  // No token present in the request
    }

    try {
      // If the token is valid, it will not throw an error
      await this.jwtService.verifyAsync(token);
      return true;
    } catch (error) {
      return false;  // Invalid or expired token
    }
  }
}