import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  @UseGuards(JwtAuthGuard) // Protect with JWT authentication
  @Get()
  async getDashboard(@Req() req) {
    // Extract user info from the request (sent via JWT)
    const user = req.user;
    
    // Simulated response (replace with actual data)
    return {
      message: 'Dashboard Data Retrieved Successfully',
      userId: user.userId,
      role: user.role,
      totalOrders: 500,
      pendingOrders: 75,
      deliveriesInProgress: 28,
      failedDeliveries: 65,
    };
  }
}
