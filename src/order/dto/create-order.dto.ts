import { IsEnum, IsNotEmpty, IsString, IsPhoneNumber, IsInt, Matches } from 'class-validator';
import { Status } from '../entities/order.entity';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  parcelId: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be in international format (+1234567890) or valid local format' })
  phoneNumber: string;
  
  @IsEnum(Status)
  deliveryStatus: Status;
}
