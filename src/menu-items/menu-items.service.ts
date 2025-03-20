// ./menutraining-server/src/menu-items/menu-items.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItemSchemaClass } from './menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItemSchemaClass.name)
    private menuItemModel: Model<MenuItemSchemaClass>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    userId: string,
    userRole: string,
  ) {
    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      createMenuItemDto.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    const menuItemId = await this.generateMenuItemId();
    const createdMenuItem = new this.menuItemModel({
      ...createMenuItemDto,
      menuItemId,
    });
    const savedMenuItem = await createdMenuItem.save();
    return savedMenuItem.toJSON();
  }

  async findAll(queryDto: QueryMenuItemDto, userId: string, userRole: string) {
    const { page = 1, limit = 10, ingredientId, restaurantId } = queryDto;
    const filter: any = {};

    if (ingredientId) {
      filter.menuItemIngredients = ingredientId;
    }

    // If restaurantId is provided, filter by it
    if (restaurantId) {
      // Check restaurant access if not an admin
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
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
      // If no restaurantId provided, for non-admin users, only show menu items for restaurants they have access to
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
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

    const menuItems = await this.menuItemModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return menuItems.map((menuItem) => menuItem.toJSON());
  }

  async findOne(id: string, userId: string, userRole: string) {
    const menuItem = await this.menuItemModel.findById(id).exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menuItem.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this menu item',
        );
      }
    }

    return menuItem.toJSON();
  }

  async findByMenuItemId(menuItemId: string, userId: string, userRole: string) {
    const menuItem = await this.menuItemModel.findOne({ menuItemId }).exec();

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID "${menuItemId}" not found`,
      );
    }

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menuItem.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this menu item',
        );
      }
    }

    return menuItem.toJSON();
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    userId: string,
    userRole: string,
  ) {
    const menuItem = await this.menuItemModel.findById(id).exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuItem.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this menu item',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateMenuItemDto.restaurantId &&
      updateMenuItemDto.restaurantId !== menuItem.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing menu item',
      );
    }

    const updatedMenuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .exec();

    if (!updatedMenuItem) {
      throw new NotFoundException(
        `Menu item with ID "${id}" not found after update`,
      );
    }

    return updatedMenuItem.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    const menuItem = await this.menuItemModel.findById(id).exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuItem.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this menu item',
      );
    }

    await this.menuItemModel.findByIdAndDelete(id).exec();
  }

  private async generateMenuItemId(): Promise<string> {
    const lastMenuItem = await this.menuItemModel
      .findOne({}, { menuItemId: 1 })
      .sort({ menuItemId: -1 })
      .exec();

    if (!lastMenuItem) {
      return 'MID-000001';
    }

    const lastId = lastMenuItem.menuItemId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;

    return `MID-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
