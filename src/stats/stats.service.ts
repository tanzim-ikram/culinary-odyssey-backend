import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order, Status } from '../order/entities/order.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async getStatistics() {
        // ✅ Get the start of the current week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Get Sunday of the current week
        startOfWeek.setHours(0, 0, 0, 0); // Reset time

        // ✅ Get the start of next week (for range filtering)
        const startOfNextWeek = new Date(startOfWeek);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7); // Move to next Sunday

        // ✅ Count total parcels (ONLY this week's orders)
        const totalParcels = await this.orderRepository.count({
            where: {
                orderCreated: Between(startOfWeek, startOfNextWeek),
            },
        });

        // ✅ Count successful deliveries (ONLY this week's orders)
        const successfulDeliveries = await this.orderRepository.count({
            where: {
                deliveryStatus: Status.DELIVERED,
                orderCreated: Between(startOfWeek, startOfNextWeek),
            },
        });

        // ✅ Count failed deliveries (ONLY this week's orders)
        const failedDeliveries = await this.orderRepository.count({
            where: {
                deliveryStatus: Status.FAILED,
                orderCreated: Between(startOfWeek, startOfNextWeek),
            },
        });

        // ✅ Customers by Location (Current Week Only)
        const customersByLocation = await this.orderRepository
            .createQueryBuilder('o')
            .select("SPLIT_PART(o.address, ',', 2)", 'location') // Extract main area
            .addSelect('COUNT(o.id)', 'count')
            .where("o.orderCreated BETWEEN :start AND :end", { start: startOfWeek, end: startOfNextWeek })
            .groupBy("SPLIT_PART(o.address, ',', 2)")
            .getRawMany();

        // ✅ Successful vs Failed Deliveries by **ALL** Months, Sorted Chronologically
        const deliveryByMonth = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                "TO_CHAR(o.orderCreated, 'YYYY') AS year",  // Extract year
                "TO_CHAR(o.orderCreated, 'Month') AS month", // Extract full month name
                "TO_CHAR(o.orderCreated, 'MM') AS month_number", // Extract numeric month (for sorting)
                "SUM(CASE WHEN o.deliveryStatus = 'DELIVERED' THEN 1 ELSE 0 END) AS successful",
                "SUM(CASE WHEN o.deliveryStatus = 'FAILED' THEN 1 ELSE 0 END) AS failed"
            ])
            .groupBy("TO_CHAR(o.orderCreated, 'YYYY'), TO_CHAR(o.orderCreated, 'Month'), TO_CHAR(o.orderCreated, 'MM')")
            .orderBy("TO_CHAR(o.orderCreated, 'YYYY')", "ASC") // ✅ First, sort by year (oldest first)
            .addOrderBy("TO_CHAR(o.orderCreated, 'MM')", "ASC") // ✅ Then, sort by month within each year
            .getRawMany();

        // ✅ Orders per Day (Current Week Only)
        const ordersByDay = await this.orderRepository
            .createQueryBuilder('o')
            .select([
                "TO_CHAR(o.orderCreated, 'Day') as day",
                "COUNT(o.id) as count"
            ])
            .where("o.orderCreated BETWEEN :start AND :end", { start: startOfWeek, end: startOfNextWeek })
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
                year: entry.year.trim(),
                month: entry.month.trim(),
                successful: parseInt(entry.successful, 10),
                failed: parseInt(entry.failed, 10),
            })),
            dayWiseOrders
        };
    }
}
