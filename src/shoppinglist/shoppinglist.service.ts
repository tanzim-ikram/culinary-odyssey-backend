import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingList, shoppingStatus } from './entities/shoppinglist.entity';
import { User } from '../user/entities/user.entity';

export interface ShoppingListInterface {
  name: string;
  quantity: number;
  unit?: string;
  status?: shoppingStatus;
  userId: number;
}

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(ShoppingList)
    private shoppingListRepository: Repository<ShoppingList>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ Create a new shopping list item (Linked to a specific user)
  async create(data: ShoppingListInterface): Promise<ShoppingList> {
    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const shoppingList = this.shoppingListRepository.create({ ...data, user });

    return this.shoppingListRepository.save(shoppingList);
  }

  // ✅ Fetch shopping list items **ONLY** for the logged-in user
  async findAll(userId: number): Promise<ShoppingList[]> {
    return this.shoppingListRepository.find({ 
      where: { user: { id: userId } }, // ✅ Fetch **ONLY** the logged-in user's items
    });
  }

  // ✅ Update only if the shopping list belongs to the logged-in user
  async update(id: number, updateData: Partial<ShoppingListInterface>, userId: number): Promise<void> {
    const shoppingList = await this.shoppingListRepository.findOne({ where: { id }, relations: ['user'] });

    if (!shoppingList) {
      throw new NotFoundException('Shopping list item not found');
    }

    if (shoppingList.user.id !== userId) {  // ✅ Corrected `userId` check
      throw new ForbiddenException('You are not authorized to update this shopping list item');
    }

    await this.shoppingListRepository.update(id, updateData);
  }

  // ✅ Delete only if the shopping list belongs to the logged-in user
  async delete(id: number, userId: number): Promise<void> {
    const shoppingList = await this.shoppingListRepository.findOne({ where: { id }, relations: ['user'] });

    if (!shoppingList) {
      throw new NotFoundException('Shopping list item not found');
    }

    if (shoppingList.user.id !== userId) {  // ✅ Corrected `userId` check
      throw new ForbiddenException('You are not authorized to delete this shopping list item');
    }

    await this.shoppingListRepository.delete(id);
  }
}
