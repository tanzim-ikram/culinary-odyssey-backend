import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from '../auth/dto/signup.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

}
