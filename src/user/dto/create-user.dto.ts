import { IsString, IsEmail, IsNotEmpty, IsDateString, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDateString()
  @IsNotEmpty()
  dob: string; // Should be a valid date in ISO 8601 format

  @IsString()
  @IsOptional()
  education?: string; // Optional, as it might not always be provided

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber(null) // Automatically checks the phone number format based on the country code
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
