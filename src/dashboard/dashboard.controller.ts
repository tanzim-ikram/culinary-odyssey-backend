import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard) // Protect this route
  @Get()
  async getDashboardData(@Req() req) {
    const userId = req.user.userId; // Extract userId from JWT token
    return this.dashboardService.getDashboardData(userId);
  }
}
