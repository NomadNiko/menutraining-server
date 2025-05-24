import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RestaurantSchemaClass } from './restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { UsersService } from '../users/users.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(RestaurantSchemaClass.name)
    private restaurantModel: Model<RestaurantSchemaClass>,
    private usersService: UsersService,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto, userId: string) {
    const restaurantId = await this.generateRestaurantId();
    const createdRestaurant = new this.restaurantModel({
      ...createRestaurantDto,
      restaurantId,
      createdBy: userId,
      associatedUsers: [userId], // Automatically associate creator
    });
    const savedRestaurant = await createdRestaurant.save();
    return savedRestaurant.toJSON();
  }

  async findAll(
    queryDto: QueryRestaurantDto,
    userId: string,
    userRole: string,
  ) {
    const { page = 1, limit = 10, name } = queryDto;
    const filter: any = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // Check if user is admin
    const isAdmin = String(userRole) === String(RoleEnum.admin);

    // If not an admin, only show restaurants they're associated with
    if (!isAdmin) {
      // Filter restaurants where this user is in the associatedUsers array
      filter.associatedUsers = userId;
    }

    const restaurants = await this.restaurantModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return restaurants.map((restaurant) => restaurant.toJSON());
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return restaurant.toJSON();
  }

  async findByRestaurantId(restaurantId: string) {
    const restaurant = await this.restaurantModel
      .findOne({ restaurantId })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    return restaurant.toJSON();
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    userId: string,
    userRole: string,
  ) {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
      .exec();
    if (!updatedRestaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${id}" not found after update`,
      );
    }
    return updatedRestaurant.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    await this.restaurantModel.findByIdAndDelete(id).exec();
  }

  async addUserToRestaurant(
    restaurantId: string,
    userToAddId: string,
    requestingUserId: string,
    userRole: string,
  ) {
    const restaurant = await this.restaurantModel
      .findOne({ restaurantId })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    // Check if user is already associated
    if (restaurant.associatedUsers.includes(userToAddId)) {
      return restaurant.toJSON(); // Already associated
    }
    // Add association
    restaurant.associatedUsers.push(userToAddId);
    await restaurant.save();
    return restaurant.toJSON();
  }

  async removeUserFromRestaurant(
    restaurantId: string,
    userToRemoveId: string,
    requestingUserId: string,
    userRole: string,
  ) {
    const restaurant = await this.restaurantModel
      .findOne({ restaurantId })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    // Prevent removal of creator/owner
    if (restaurant.createdBy === userToRemoveId) {
      throw new ForbiddenException('Cannot remove the restaurant creator');
    }
    // Remove association
    restaurant.associatedUsers = restaurant.associatedUsers.filter(
      (id) => id !== userToRemoveId,
    );
    await restaurant.save();
    return restaurant.toJSON();
  }

  async getUsersForRestaurant(
    restaurantId: string,
    requestingUserId: string,
    userRole: string,
  ) {
    const restaurant = await this.restaurantModel
      .findOne({ restaurantId })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID "${restaurantId}" not found`,
      );
    }
    // Get the users first
    const users = await this.usersService.findByIds(restaurant.associatedUsers);
    // Transform the response to only include the fields we need
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      photo: user.photo,
      role: {
        id: user.role?.id,
      },
    }));
  }

  async checkUserRestaurantAccess(
    userId: string,
    restaurantId: string,
    userRole: string,
  ) {
    // Admins always have access
    if (userRole === RoleEnum[RoleEnum.admin].toString()) {
      return true;
    }
    const restaurant = await this.restaurantModel
      .findOne({ restaurantId })
      .exec();
    if (!restaurant) {
      return false;
    }
    return restaurant.associatedUsers.includes(userId);
  }

  private async generateRestaurantId(): Promise<string> {
    const lastRestaurant = await this.restaurantModel
      .findOne({}, { restaurantId: 1 })
      .sort({ restaurantId: -1 })
      .exec();
    if (!lastRestaurant) {
      return 'RST-000001';
    }
    const lastId = lastRestaurant.restaurantId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;
    return `RST-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
