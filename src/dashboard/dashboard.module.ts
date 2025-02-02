import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entities/order.entity';
import { User } from '../user/entities/user.entity';
import { ShoppingList } from '../shoppinglist/entities/shoppinglist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, ShoppingList])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
