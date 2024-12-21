import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  parcelId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(Status)
  deliveryStatus: Status; // Defaults to Pending or can be set explicitly
}
