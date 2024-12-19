import { IsEmail, IsNotEmpty, IsString, IsDateString, Matches } from 'class-validator';

export class AuthDto {
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;

  @IsNotEmpty({ message: 'Date of Birth is required' })
  @IsDateString()
  dob: string;

  @IsNotEmpty({ message: 'Educational level is required' })
  @IsString({ message: 'Educational level must be a string' })
  educationalLevel: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\d+$/, { message: 'Phone number must contain digits only' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Country is required' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}/, {
    message: 'Password must contain letters, numbers, and special characters',
  })
  password: string;
}
