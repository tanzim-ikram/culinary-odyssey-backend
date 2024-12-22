import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStatistics() {
    const stats = await this.statsService.getStatistics();
    return {
      totalParcels: stats.totalParcels,
      successfulDeliveries: stats.successfulDeliveries,
      failedDeliveries: stats.failedDeliveries,
      customersByLocation: stats.customersByLocation.map((entry) => ({
        location: entry.location,
        count: parseInt(entry.count, 10),
      })),
    };
  }
}
