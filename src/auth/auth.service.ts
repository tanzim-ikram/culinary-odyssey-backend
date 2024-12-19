import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { AuthDto } from './dto/auth.dto';
import { SignInDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,

    private readonly jwtService: JwtService,
  ) { }

  // Sign Up Method
  async signUp(authDto: AuthDto): Promise<any> {
    const {
      email,
      password,
      firstName,
      lastName,
      gender,
      dob,
      educationalLevel,
      phoneNumber,
      country,
      city,
    } = authDto;

    // Check if the user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create profile linked to user
    const profile = this.profileRepository.create({
      firstName,
      lastName,
      gender,
      dob,
      educationalLevel,
      phoneNumber,
      country,
      city,
      user: savedUser,
    });

    await this.profileRepository.save(profile);

    return {
      message: 'User created successfully!',
      user: { id: savedUser.id, email: savedUser.email },
    };
  }

  // Sign In Method
  async signIn(signInDto: SignInDto, res: Response) {
    try {
      const { email, password } = signInDto;
  
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['profile'],
      });
  
      if (!user) {
        throw new NotFoundException('Invalid email or password!');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password!');
      }
  
      const payload = { userId: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(payload);
  
      // Set the token in the cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Make sure it's true in production
        maxAge: 3600000, // 1 hour
        path: '/',
      });
  
      return res.status(200).json({
        message: 'Logged in successfully!',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Error during sign-in:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message || 'An unknown error occurred',
      });
    }
  }
  
  // Sign out functionality
  // async logout(req: Request, res: Response) {
  //   const token = req.cookies['access_token'];

  //   if (!token) {
  //     throw new HttpException('Token missing or expired', HttpStatus.UNAUTHORIZED);
  //   }

  //   // Clear the token cookie
  //   res.clearCookie('access_token', { path: '/' });

  //   return { message: 'Logged out successfully' };
  // }
  
  // Validate User (Used by Passport Strategies)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user; // User validated
  }
}
