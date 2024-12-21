import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { User } from '../user/entities/user.entity'; // Assuming User entity is defined here
import { CreateOrderDto } from './dto/create-order.dto'; // A DTO for creating an order

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(User) private readonly userRepository: Repository<User>, // For handling user validation
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UnauthorizedException('Invalid user');
        }

        const order = this.orderRepository.create({
            ...createOrderDto,
            user, // Properly associate the user
        });

        return this.orderRepository.save(order); // Save and return the created order
    }

    async getUserOrders(userId: number): Promise<any[]> {
        const orders = await this.orderRepository.find({
            where: { user: { id: userId } }, // Fetch only orders for the logged-in user
            relations: ['user'], // Include the user relation
        });

        // Transform the orders to include userId directly instead of nesting the user object
        return orders.map(order => ({
            id: order.id,
            customerName: order.customerName,
            parcelId: order.parcelId,
            address: order.address,
            phoneNumber: order.phoneNumber,
            deliveryStatus: order.deliveryStatus,
            userId: order.user.id, // Extract the user's id
        }));
    }

    async getCustomersByUserId(userId: number): Promise<Partial<Order[]>> {
        return this.orderRepository.find({
            where: { user: { id: userId } }, // Fetch orders associated with the logged-in user
            select: ['customerName', 'address', 'phoneNumber'], // Only fetch required fields
        });
    }
}
