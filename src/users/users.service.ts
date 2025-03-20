// ./menutraining-server/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from './dto/query-user.dto';
import { User } from './domain/user';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCreateService } from './services/user-create.service';
import { UserReadService } from './services/user-read.service';
import { UserUpdateService } from './services/user-update.service';
import { UserDeleteService } from './services/user-delete.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly userReadService: UserReadService,
    private readonly userUpdateService: UserUpdateService,
    private readonly userDeleteService: UserDeleteService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userCreateService.create(createUserDto);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.userReadService.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.userReadService.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.userReadService.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.userReadService.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.userReadService.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.userUpdateService.update(id, updateUserDto);
  }

  async remove(id: User['id']): Promise<void> {
    await this.userDeleteService.remove(id);
  }

  async associateWithRestaurant(
    userId: User['id'],
    restaurantId: string,
  ): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    if (!user.associatedRestaurants) {
      user.associatedRestaurants = [];
    }

    if (!user.associatedRestaurants.includes(restaurantId)) {
      user.associatedRestaurants.push(restaurantId);
      return this.update(userId, {
        associatedRestaurants: user.associatedRestaurants,
      });
    }

    return user;
  }

  async removeFromRestaurant(
    userId: User['id'],
    restaurantId: string,
  ): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user || !user.associatedRestaurants) {
      return null;
    }

    user.associatedRestaurants = user.associatedRestaurants.filter(
      (id) => id !== restaurantId,
    );

    return this.update(userId, {
      associatedRestaurants: user.associatedRestaurants,
    });
  }

  async hasRole(userId: User['id'], roleId: number): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.role) {
      return false;
    }

    return String(user.role.id) === String(roleId);
  }
}
