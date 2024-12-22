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
        const totalParcels = await this.orderRepository.count();

        const successfulDeliveries = await this.orderRepository.count({
            where: { deliveryStatus: Status.DELIVERED },
        });

        const failedDeliveries = await this.orderRepository.count({
            where: { deliveryStatus: Status.FAILED },
        });

        const customersByLocation = await this.orderRepository
            .createQueryBuilder('o')
            .select('o.address', 'address')
            .addSelect('COUNT(o.id)', 'count')
            .groupBy('o.address')
            .getRawMany();

        return {
            totalParcels,
            successfulDeliveries,
            failedDeliveries,
            customersByLocation: customersByLocation.map((entry) => ({
                location: entry.address,
                count: entry.count, // No need to use parseInt if entry.count is already a number
            })),
        };
    }
}
