import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import { CustomerController } from 'src/customer/customer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [OrderController, CustomerController], // Register the controller here
  providers: [OrderService],
})
export class OrderModule {}
