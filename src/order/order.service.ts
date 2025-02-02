import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, Status } from './entities/order.entity';
import { User } from '../user/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    // Fetch logged-in user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    // Create new order linked to user
    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      orderCreated: new Date(), // Auto-set order creation date
      user, // Auto-set user association
    });

    return await this.orderRepository.save(newOrder);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async getCustomersByUserId(userId: number): Promise<any[]> {
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } }, // Fetch orders linked to the user
      relations: ['user'],
      select: ['customerName', 'address', 'phoneNumber', 'orderCreated'], // Return only customer details
    });
  
    if (!orders.length) {
      throw new NotFoundException('No customers found for this user');
    }
  
    return orders.map(order => ({
      customerName: order.customerName,
      address: order.address,
      phoneNumber: order.phoneNumber,
      orderCreated: order.orderCreated,
    }));
  }
  
}
