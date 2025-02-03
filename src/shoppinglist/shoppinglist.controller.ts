import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ShoppingListInterface, ShoppingListService } from './shoppinglist.service';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('shoppinglist')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() data: Omit<ShoppingListInterface, 'userId'>,
    @Req() request: Request & { user: { userId: number } },
  ) {
    const userId = request.user.userId;
    console.log(userId);
    const shoppingList = await this.shoppingListService.create({ ...data, userId });

    return {
      id: shoppingList.id,
      name: shoppingList.name,
      quantity: shoppingList.quantity,
      unit: shoppingList.unit || null,
      status: shoppingList.status,
    };
  }

  // ✅ Fetch only the logged-in user's shopping list
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() request: Request & { user: { userId: number } }) {
    const userId = request.user.userId;
    const shoppingLists = await this.shoppingListService.findAll(userId);
    return shoppingLists.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || null,
      status: item.status,
    }));
  }

  // ✅ Allow update only if the item belongs to the logged-in user
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number, 
    @Body() updateData: Partial<ShoppingListInterface>,
    @Req() request: Request & { user: { userId: number } },
  ) {
    const userId = request.user.userId;
    await this.shoppingListService.update(id, updateData, userId);
    return 'Shopping list updated successfully!';
  }

  // ✅ Allow delete only if the item belongs to the logged-in user
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: number, 
    @Req() request: Request & { user: { userId: number } },
  ) {
    const userId = request.user.userId;
    await this.shoppingListService.delete(id, userId);
    return 'Shopping list deleted successfully!';
  }
}
