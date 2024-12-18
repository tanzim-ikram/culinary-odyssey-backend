import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import { SignInDto } from './dto/signin.dto';
import { SignInResponse } from './dto/response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Sign Up Method
  async signUp(authDto: AuthDto): Promise<any> {
    const { email, password, firstName, lastName, gender, dob, educationalLevel, phoneNumber, country, city } = authDto;

    // Check if the user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword, // Store hashed password
      firstName,
      lastName,
      gender,
      dob,
      educationalLevel,
      phoneNumber,
      country,
      city,
    });

    await this.userRepository.save(user);

    return {
      message: 'User created successfully!',
      user: { id: user.id, email: user.email },
    };
  }

  // Sign In Method
  async signIn(signInDto: SignInDto, res): Promise<any> {
    const { email, password } = signInDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Invalid email or password!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid email or password!');
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

     // Set the access token in the response cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 3600000, // 1 hour
    path: '/',
  });

  // Send a proper response to Postman
  return res.status(200).json({
    message: 'Logged in successfully!',
    accessToken,
  });
  }

  // Validate User Method (Used by Passport Strategies)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user; // User validation successful
  }
}
