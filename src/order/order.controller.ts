import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { OrderService } from './order.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ensure authentication
  import { CreateOrderDto } from './dto/create-order.dto';
  
  @Controller()
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @UseGuards(JwtAuthGuard)
    @Post('orders')
    async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
      return this.orderService.createOrder(createOrderDto, req.user.userId); // Ensure only logged-in user can create an order
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('orderdetails')
    async getUserOrders(@Request() req) {
      return this.orderService.getUserOrders(req.user.userId); // Fetch orders for the logged-in user
    }
  }
  