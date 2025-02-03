import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, Status } from '../order/entities/order.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async getStatistics() {
        // ✅ Count total parcels
        const totalParcels = await this.orderRepository.count();

        // ✅ Count successful deliveries
        const successfulDeliveries = await this.orderRepository.count({
            where: { deliveryStatus: Status.DELIVERED },
        });

        // ✅ Count failed deliveries
        const failedDeliveries = await this.orderRepository.count({
            where: { deliveryStatus: Status.FAILED },
        });

        // ✅ Count Customers by Location (Extracting main area)
        const customersByLocation = await this.orderRepository
            .createQueryBuilder('o')
            .select("SPLIT_PART(o.address, ',', 2)", 'location') // Extract the last meaningful part
            .addSelect('COUNT(o.id)', 'count')
            .groupBy("SPLIT_PART(o.address, ',', 2)")
            .getRawMany();

        // ✅ Count Successful vs Failed Deliveries by Month
        const deliveryByMonth = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                "TO_CHAR(o.orderCreated, 'Month') AS month", // Extracts month name
                "SUM(CASE WHEN o.deliveryStatus = 'DELIVERED' THEN 1 ELSE 0 END) AS successful",
                "SUM(CASE WHEN o.deliveryStatus = 'FAILED' THEN 1 ELSE 0 END) AS failed"
            ])
            .groupBy("TO_CHAR(o.orderCreated, 'Month')")
            .orderBy("TO_CHAR(o.orderCreated, 'Month')", "ASC")
            .getRawMany();

        // ✅ Orders per Day (like Sat: 5, Sun: 10)
        const ordersByDay = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                "TO_CHAR(o.orderCreated, 'Day') as day", // Extracts full day name
                "COUNT(o.id) as count"
            ])
            .groupBy("TO_CHAR(o.orderCreated, 'Day')")
            .orderBy("TO_CHAR(o.orderCreated, 'Day')", "ASC")
            .getRawMany();

        // ✅ Convert day-wise order count into a structured object
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayWiseOrders = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

        ordersByDay.forEach(order => {
            const formattedDay = order.day.trim(); // Trim whitespace
            if (formattedDay in dayWiseOrders) {
                dayWiseOrders[formattedDay] = parseInt(order.count, 10);
            }
        });

        return {
            totalParcels,
            successfulDeliveries,
            failedDeliveries,
            customersByLocation: customersByLocation.map((entry) => ({
                location: entry.location.trim(),
                count: parseInt(entry.count, 10),
            })),
            successfulVsFailedByMonth: deliveryByMonth.map((entry) => ({
                month: entry.month.trim(),
                successful: parseInt(entry.successful, 10),
                failed: parseInt(entry.failed, 10),
            })),
            dayWiseOrders
        };
    }
}
