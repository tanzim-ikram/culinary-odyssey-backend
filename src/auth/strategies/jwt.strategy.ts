import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'abcd1234',  // Secret key for JWT, should match with token generation
    });
  }

  async validate(payload: any) {
    console.log('JWT payload:', payload);  // Add logging for payload to debug if the token is being parsed correctly
    const { userId } = payload;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid token: User not found');
    }
    return user;  // Attach user to the request
  }
}
