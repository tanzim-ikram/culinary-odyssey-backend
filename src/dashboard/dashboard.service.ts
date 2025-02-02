import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, Status } from '../order/entities/order.entity';
import { User } from '../user/entities/user.entity';
import { ShoppingList } from '../shoppinglist/entities/shoppinglist.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(ShoppingList) private readonly shoppingListRepository: Repository<ShoppingList>,
    ) { }

    async getDashboardData(userId: number) {
        // ✅ Fetch user details (first name, user ID, role)
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        const totalDeliveries = await this.orderRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'count')
            .getRawOne();

        const pendingDeliveries = await this.orderRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'count')
            .where('order.deliveryStatus = :status', { status: Status.PENDING })
            .getRawOne();

        const deliveriesInProgress = await this.orderRepository.count({ where: { deliveryStatus: Status.IN_PROCESS } });
        const failedDeliveries = await this.orderRepository.count({ where: { deliveryStatus: Status.FAILED } });

        // ✅ Fetch Top 10 Orders
        const topOrders = await this.orderRepository.createQueryBuilder('order')
            .select(['order.id', 'order.customerName', 'order.parcelId', 'order.address', 'order.deliveryStatus'])
            .orderBy('order.id', 'DESC')
            .limit(10)
            .getMany(); // ✅ Use getMany() to return full entity objects

        // ✅ Fetch Day-wise Order Counts
        const orders = await this.orderRepository.createQueryBuilder('order')
            .select([
                "TO_CHAR(order.orderCreated, 'Day') as day", // ✅ Extracts full day name
                "COUNT(order.id) as count"
            ])
            .groupBy("TO_CHAR(order.orderCreated, 'Day')")
            .orderBy("TO_CHAR(order.orderCreated, 'Day')", "ASC")
            .getRawMany();

        // Convert raw data into a structured object
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayWiseOrders = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

        orders.forEach(order => {
            const formattedDay = order.day.trim(); // Trim whitespace
            if (formattedDay in dayWiseOrders) {
                dayWiseOrders[formattedDay] = parseInt(order.count, 10);
            }
        });

        // ✅ Fetch Top 5 Shopping Lists
        const topShoppingLists = await this.shoppingListRepository.find({
            order: { id: 'DESC' }, // ✅ Sort by ID if `createdAt` does not exist
            take: 5,
        });

        // ✅ Extract Unique Locations for Map
        const uniqueLocations = Array.from(
            new Set(
                topOrders
                    .map(order => {
                        if (!order || !order.address) return null; // ✅ Ensure order and address exist
                        const parts = order.address.split(',');
                        return parts.length > 1 ? parts.pop()?.trim() : parts[0]?.trim(); // ✅ Extract last meaningful part
                    })
                    .filter(location => location && location.length > 1) // ✅ Filter out null/empty values
            )
        ).slice(0, 10);


        return {
            user: {
                firstName: user.profile?.firstName || 'N/A',
                userId: user.id,
                role: user.role,
            },
            stats: {
                totalDeliveries,
                pendingDeliveries,
                deliveriesInProgress,
                failedDeliveries,
            },
            topOrders,
            dayWiseOrders,
            topShoppingLists,
            mapLocations: uniqueLocations,
        };
    }
}
