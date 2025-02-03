import { Injectable, NotFoundException } from '@nestjs/common';
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
    private userRepository: Repository<User>, // Inject the User repository
  ) {}

  async create(data: ShoppingListInterface): Promise<ShoppingList> {
    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException('User not found'); // Return meaningful error
    }

    const shoppingList = this.shoppingListRepository.create({
      ...data,
      user,
    });

    return this.shoppingListRepository.save(shoppingList);
  }

  async findAll(): Promise<ShoppingList[]> {
    return this.shoppingListRepository.find({ relations: ['user'] });
  }

  async update(id: number, updateData: Partial<ShoppingListInterface>): Promise<void> {
    await this.shoppingListRepository.update(id, updateData);
  }

  async delete(id: number): Promise<void> {
    await this.shoppingListRepository.delete(id);
  }
}
