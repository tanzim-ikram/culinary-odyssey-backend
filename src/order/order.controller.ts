import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    Req,
  } from '@nestjs/common';
  import { OrderService } from './order.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ensure authentication
  import { CreateOrderDto } from './dto/create-order.dto';
  
  @Controller()
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @UseGuards(JwtAuthGuard)
    @Post('orders')
    async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
      const userId = req.user.userId; // Extract `userId` from request (set by JWT Guard)
      return this.orderService.createOrder(createOrderDto, userId); // Pass extracted userId
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('orderdetails')
    async getUserOrders(@Request() req) {
      return this.orderService.getUserOrders(req.user.userId); // Fetch orders for the logged-in user
    }
  }
  