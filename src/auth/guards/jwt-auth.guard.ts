import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token not found'); // Handle missing token
    }

    const token = authHeader.split(' ')[1]; // Extract token

    try {
      const user = this.jwtService.verify(token); // Decode and verify the token
      request.user = user;  // Attach user data to request object
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token'); // Handle invalid or expired token
    }

    return true;
  }
}
