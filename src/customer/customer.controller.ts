import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
export class CustomerController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCustomers(@Req() req: any) {
    // console.log('User from token:', req.user); // Debugging step
    const userId = req.user.userId; // Ensure `id` is extracted from `req.user`
    
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const customers = await this.orderService.getCustomersByUserId(userId);

    return customers.map((customer) => ({
      customerName: customer.customerName,
      address: customer.address,
      phoneNumber: customer.phoneNumber,
    }));
  }
}
