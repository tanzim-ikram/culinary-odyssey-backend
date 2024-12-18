import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Bearer Token
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: 'abc', // Use environment variables for security
    });
  }

  // Validate the decoded JWT payload
  async validate(payload: { userId: number; email: string }) {
    if (!payload) {
      throw new UnauthorizedException('Invalid Token');
    }
    // Attach userId and email to the request
    return { userId: payload.userId, email: payload.email };
  }
}
