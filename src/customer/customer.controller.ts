import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
export class CustomerController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard) // Ensure only authenticated users can access this route
  @Get()
  async getCustomers(@Req() req: any) {
    const userId = req.user.id; // Extract user ID from the JWT payload
    return this.orderService.getCustomersByUserId(userId);
  }
}
