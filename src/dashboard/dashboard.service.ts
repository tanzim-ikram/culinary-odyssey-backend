import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, Status } from '../order/entities/order.entity';
import { User } from '../user/entities/user.entity';
import { ShoppingList } from '../shoppinglist/entities/shoppinglist.entity';
import { startOfWeek, endOfWeek } from 'date-fns';

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

        // ✅ Fetch only orders belonging to this user
        const totalDeliveries = await this.orderRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'count')
            .where('order.deliveryStatus = :status AND order.userId = :userId', { status: Status.DELIVERED, userId })
            // .where('order.userId = :userId', { userId }) // Filter by userId
            .getRawOne();

        const pendingDeliveries = await this.orderRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'count')
            .where('order.deliveryStatus = :status AND order.userId = :userId', { status: Status.PENDING, userId })
            .getRawOne();

        const deliveriesInProgress = await this.orderRepository.count({ where: { deliveryStatus: Status.IN_PROCESS, user: { id: userId } } });
        const failedDeliveries = await this.orderRepository.count({ where: { deliveryStatus: Status.FAILED, user: { id: userId } } });

        // ✅ Fetch Top 5 Orders only for the logged-in user
        const topOrders = await this.orderRepository.createQueryBuilder('order')
            .select(['order.id', 'order.customerName', 'order.parcelId', 'order.address', 'order.deliveryStatus'])
            .where('order.userId = :userId', { userId }) // Filter orders by user ID
            .orderBy('order.id', 'DESC')
            .limit(5)
            .getMany();

        // ✅ Get Start & End of the Current Week
        const now = new Date();
        const startOfWeekDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday as the start
        const endOfWeekDate = endOfWeek(now, { weekStartsOn: 0 });

        // ✅ Fetch Day-wise Order Counts for the Current Week Only
        const ordersByDay = await this.orderRepository.createQueryBuilder('order')
            .select([
                "TO_CHAR(order.orderCreated, 'Day') as day",
                "COUNT(order.id) as count"
            ])
            .where("order.orderCreated BETWEEN :start AND :end AND order.userId = :userId", { 
                start: startOfWeekDate.toISOString(), 
                end: endOfWeekDate.toISOString(),
                userId
            })
            .groupBy("TO_CHAR(order.orderCreated, 'Day')")
            .orderBy("TO_CHAR(order.orderCreated, 'Day')", "ASC")
            .getRawMany();

        // ✅ Convert raw data into a structured object
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayWiseOrders = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

        ordersByDay.forEach(order => {
            const formattedDay = order.day.trim();
            if (formattedDay in dayWiseOrders) {
                dayWiseOrders[formattedDay] = parseInt(order.count, 10);
            }
        });

        // ✅ Fetch Top 5 Shopping Lists only for the logged-in user
        const topShoppingLists = await this.shoppingListRepository.find({
            where: { user: { id: userId } }, // Filter shopping lists by user ID
            order: { id: 'DESC' },
            take: 5,
        });

        // ✅ Extract Unique Locations for Map (Only user's orders)
        const uniqueLocations = Array.from(
            new Set(
                topOrders
                    .map(order => {
                        if (!order || !order.address) return null;
                        const parts = order.address.split(',');
                        return parts.length > 1 ? parts.pop()?.trim() : parts[0]?.trim();
                    })
                    .filter(location => location && location.length > 1)
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
            dayWiseOrders, // ✅ Only includes current week's data
            topShoppingLists, // ✅ Only includes this user's shopping list
            mapLocations: uniqueLocations, // ✅ Extracts locations only from this user's orders
        };
    }
}
