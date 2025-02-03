import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ShoppingListInterface, ShoppingListService } from './shoppinglist.service';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust the path based on your setup
import { Request } from 'express';

@Controller('shoppinglist')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() data: Omit<ShoppingListInterface, 'userId'>,
    @Req() request: Request & { user: { id: number } },
  ) {
    const userId = request.user.id; // Extract the user ID from the logged-in user's session
    const shoppingList = await this.shoppingListService.create({ ...data, userId });
    return {
      id: shoppingList.id,
      name: shoppingList.name,
      quantity: shoppingList.quantity,
      unit: shoppingList.unit || null,
      // price: shoppingList.price, // Ensure the price is a string with two decimal places
      status: shoppingList.status,
      user: {
        id: shoppingList.user.id,
        email: shoppingList.user.email,
        role: shoppingList.user.role,
      },
    };
  }

  @Get()
  async findAll() {
    const shoppingLists = await this.shoppingListService.findAll();
    return shoppingLists.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || null, // Handle the possibility of `null`
      // price: item.price, // Ensure price is a string with two decimal places
      status: item.status,
    }));
  }


  @Put(':id')
  async update(@Param('id') id: number, @Body() updateData: Partial<ShoppingListInterface>) {
    await this.shoppingListService.update(id, updateData);
    return 'Shopping list updated successfully!';
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.shoppingListService.delete(id);
    return 'Shopping list deleted successfully!';
  }
}
