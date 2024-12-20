import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
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
  ) {}

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
  async signIn(signInDto: SignInDto, res): Promise<any> {
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

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
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
  }

  // Logout Method
  async logout(req: Request, res: Response): Promise<any> {
    try {
      const token = req.cookies['access_token'];
      if (!token) {
        throw new UnauthorizedException('No token found in cookies!');
      }

      const decoded = this.jwtService.verify(token); // Validate token
      const userId = decoded?.userId;

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      // Update lastLogout timestamp
      await this.userRepository.update(userId, { lastLogout: new Date() });

      // Clear the token from cookies
      res.clearCookie('access_token', { path: '/' });

      return res.status(200).json({ message: 'Logged out successfully!' });
    } catch (error) {
      console.error('Error during logout:', error);
      throw new UnauthorizedException(error.message || 'Logout failed');
    }
  }

  // Validate User (Used by Passport Strategies)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user; // User validated
  }
}
