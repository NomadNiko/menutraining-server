// src/menus/menus.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuSchemaClass } from './menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class MenusService {
  constructor(
    @InjectModel(MenuSchemaClass.name)
    private menuModel: Model<MenuSchemaClass>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(createMenuDto: CreateMenuDto, userId: string, userRole: string) {
    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      createMenuDto.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    // Basic validation for time format
    if (
      createMenuDto.startTime &&
      !this.isValidTimeFormat(createMenuDto.startTime)
    ) {
      throw new BadRequestException('Start time must be in format HH:MM');
    }

    if (
      createMenuDto.endTime &&
      !this.isValidTimeFormat(createMenuDto.endTime)
    ) {
      throw new BadRequestException('End time must be in format HH:MM');
    }

    const menuId = await this.generateMenuId();
    const createdMenu = new this.menuModel({
      ...createMenuDto,
      menuId,
    });

    const savedMenu = await createdMenu.save();
    return savedMenu.toJSON();
  }

  async findAll(queryDto: QueryMenuDto, userId: string, userRole: string) {
    const { page = 1, limit = 10, name, activeDay, restaurantId } = queryDto;
    const filter: Record<string, unknown> = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (activeDay) {
      filter.activeDays = activeDay;
    }

    // If restaurantId is provided, filter by it
    if (restaurantId) {
      // Check restaurant access if not an admin
      if (String(userRole) !== String(RoleEnum.admin)) {
        const hasAccess =
          await this.restaurantsService.checkUserRestaurantAccess(
            userId,
            restaurantId,
            userRole,
          );

        if (!hasAccess) {
          throw new ForbiddenException(
            'You do not have access to this restaurant',
          );
        }
      }

      filter.restaurantId = restaurantId;
    } else {
      // If no restaurantId provided, for non-admin users, only show menus for restaurants they have access to
      if (String(userRole) !== String(RoleEnum.admin)) {
        const user =
          await this.restaurantsService['usersService'].findById(userId);

        if (
          !user ||
          !user.associatedRestaurants ||
          user.associatedRestaurants.length === 0
        ) {
          return []; // No associated restaurants
        }

        filter.restaurantId = { $in: user.associatedRestaurants };
      }
    }

    const menus = await this.menuModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return menus.map((menu) => menu.toJSON());
  }

  async findOne(id: string, userId: string, userRole: string) {
    const menu = await this.menuModel.findById(id).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menu.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this menu');
      }
    }

    return menu.toJSON();
  }

  async findByMenuId(menuId: string, userId: string, userRole: string) {
    const menu = await this.menuModel.findOne({ menuId }).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${menuId}" not found`);
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menu.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this menu');
      }
    }

    return menu.toJSON();
  }

  async update(
    id: string,
    updateMenuDto: UpdateMenuDto,
    userId: string,
    userRole: string,
  ) {
    const menu = await this.menuModel.findById(id).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menu.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this menu',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateMenuDto.restaurantId &&
      updateMenuDto.restaurantId !== menu.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing menu',
      );
    }

    // Validate time formats if provided
    if (
      updateMenuDto.startTime &&
      !this.isValidTimeFormat(updateMenuDto.startTime)
    ) {
      throw new BadRequestException('Start time must be in format HH:MM');
    }

    if (
      updateMenuDto.endTime &&
      !this.isValidTimeFormat(updateMenuDto.endTime)
    ) {
      throw new BadRequestException('End time must be in format HH:MM');
    }

    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true })
      .exec();

    if (!updatedMenu) {
      throw new NotFoundException(
        `Menu with ID "${id}" not found after update`,
      );
    }

    return updatedMenu.toJSON();
  }

  async updateByMenuId(
    menuId: string,
    updateMenuDto: UpdateMenuDto,
    userId: string,
    userRole: string,
  ): Promise<MenuSchemaClass> {
    const menu = await this.menuModel.findOne({ menuId }).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${menuId}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menu.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this menu',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateMenuDto.restaurantId &&
      updateMenuDto.restaurantId !== menu.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing menu',
      );
    }

    // Validate time formats if provided
    if (
      updateMenuDto.startTime &&
      !this.isValidTimeFormat(updateMenuDto.startTime)
    ) {
      throw new BadRequestException('Start time must be in format HH:MM');
    }

    if (
      updateMenuDto.endTime &&
      !this.isValidTimeFormat(updateMenuDto.endTime)
    ) {
      throw new BadRequestException('End time must be in format HH:MM');
    }

    const updatedMenu = await this.menuModel
      .findOneAndUpdate({ menuId }, updateMenuDto, { new: true })
      .exec();

    if (!updatedMenu) {
      throw new NotFoundException(
        `Menu with ID "${menuId}" not found after update`,
      );
    }

    return updatedMenu.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    const menu = await this.menuModel.findById(id).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menu.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this menu',
      );
    }

    await this.menuModel.findByIdAndDelete(id).exec();
  }

  async removeByMenuId(menuId: string, userId: string, userRole: string) {
    const menu = await this.menuModel.findOne({ menuId }).exec();

    if (!menu) {
      throw new NotFoundException(`Menu with ID "${menuId}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menu.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this menu',
      );
    }

    await this.menuModel.findOneAndDelete({ menuId }).exec();
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private async generateMenuId(): Promise<string> {
    const lastMenu = await this.menuModel
      .findOne({}, { menuId: 1 })
      .sort({ menuId: -1 })
      .exec();

    if (!lastMenu) {
      return 'MNU-000001';
    }

    const lastId = lastMenu.menuId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;

    return `MNU-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
