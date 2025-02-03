import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStatistics(@Req() request: Request & { user: { userId: number } }) {
    const userId = request.user.userId; // ✅ Get user ID from authenticated request
    const stats = await this.statsService.getStatistics(userId);
    return {
      totalParcels: stats.totalParcels,
      successfulDeliveries: stats.successfulDeliveries,
      failedDeliveries: stats.failedDeliveries,
      customersByLocation: stats.customersByLocation,
      successfulVsFailedByMonth: stats.successfulVsFailedByMonth,
      dayWiseOrders: stats.dayWiseOrders,
    };
  }
}
