import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuSectionSchemaClass } from './menu-section.schema';
import { CreateMenuSectionDto } from './dto/create-menu-section.dto';
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto';
import { QueryMenuSectionDto } from './dto/query-menu-section.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class MenuSectionsService {
  constructor(
    @InjectModel(MenuSectionSchemaClass.name)
    private menuSectionModel: Model<MenuSectionSchemaClass>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(
    createMenuSectionDto: CreateMenuSectionDto,
    userId: string,
    userRole: string,
  ) {
    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      createMenuSectionDto.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    // Set the order for each item if not provided
    if (createMenuSectionDto.items && createMenuSectionDto.items.length > 0) {
      createMenuSectionDto.items.forEach((item, index) => {
        if (item.order === undefined) {
          item.order = index;
        }
      });
    }

    const menuSectionId = await this.generateMenuSectionId();
    const createdMenuSection = new this.menuSectionModel({
      ...createMenuSectionDto,
      menuSectionId,
    });

    const savedMenuSection = await createdMenuSection.save();
    return savedMenuSection.toJSON();
  }

  async findAll(
    queryDto: QueryMenuSectionDto,
    userId: string,
    userRole: string,
  ) {
    const { page = 1, limit = 10, title, restaurantId } = queryDto;
    const filter: Record<string, unknown> = {};

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
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
      // If no restaurantId provided, for non-admin users, only show menu sections for restaurants they have access to
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

    const menuSections = await this.menuSectionModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return menuSections.map((section) => section.toJSON());
  }

  async findOne(id: string, userId: string, userRole: string) {
    const menuSection = await this.menuSectionModel.findById(id).exec();

    if (!menuSection) {
      throw new NotFoundException(`Menu section with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menuSection.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this menu section',
        );
      }
    }

    return menuSection.toJSON();
  }

  async findByMenuSectionId(
    menuSectionId: string,
    userId: string,
    userRole: string,
  ) {
    const menuSection = await this.menuSectionModel
      .findOne({ menuSectionId })
      .exec();

    if (!menuSection) {
      throw new NotFoundException(
        `Menu section with ID "${menuSectionId}" not found`,
      );
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        menuSection.restaurantId,
        userRole,
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this menu section',
        );
      }
    }

    return menuSection.toJSON();
  }

  async update(
    id: string,
    updateMenuSectionDto: UpdateMenuSectionDto,
    userId: string,
    userRole: string,
  ) {
    const menuSection = await this.menuSectionModel.findById(id).exec();

    if (!menuSection) {
      throw new NotFoundException(`Menu section with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuSection.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this menu section',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateMenuSectionDto.restaurantId &&
      updateMenuSectionDto.restaurantId !== menuSection.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing menu section',
      );
    }

    // If updating items, ensure the order is set for any new items
    if (updateMenuSectionDto.items && updateMenuSectionDto.items.length > 0) {
      updateMenuSectionDto.items.forEach((item, index) => {
        if (item.order === undefined) {
          item.order = index;
        }
      });
    }

    const updatedMenuSection = await this.menuSectionModel
      .findByIdAndUpdate(id, updateMenuSectionDto, { new: true })
      .exec();

    if (!updatedMenuSection) {
      throw new NotFoundException(
        `Menu section with ID "${id}" not found after update`,
      );
    }

    return updatedMenuSection.toJSON();
  }

  async updateByMenuSectionId(
    menuSectionId: string,
    updateMenuSectionDto: UpdateMenuSectionDto,
    userId: string,
    userRole: string,
  ): Promise<MenuSectionSchemaClass> {
    const menuSection = await this.menuSectionModel
      .findOne({ menuSectionId })
      .exec();

    if (!menuSection) {
      throw new NotFoundException(
        `Menu section with ID "${menuSectionId}" not found`,
      );
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuSection.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this menu section',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateMenuSectionDto.restaurantId &&
      updateMenuSectionDto.restaurantId !== menuSection.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing menu section',
      );
    }

    // If updating items, ensure the order is set for any new items
    if (updateMenuSectionDto.items && updateMenuSectionDto.items.length > 0) {
      updateMenuSectionDto.items.forEach((item, index) => {
        if (item.order === undefined) {
          item.order = index;
        }
      });
    }

    const updatedMenuSection = await this.menuSectionModel
      .findOneAndUpdate({ menuSectionId }, updateMenuSectionDto, { new: true })
      .exec();

    if (!updatedMenuSection) {
      throw new NotFoundException(
        `Menu section with ID "${menuSectionId}" not found after update`,
      );
    }

    return updatedMenuSection.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    const menuSection = await this.menuSectionModel.findById(id).exec();

    if (!menuSection) {
      throw new NotFoundException(`Menu section with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuSection.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this menu section',
      );
    }

    await this.menuSectionModel.findByIdAndDelete(id).exec();
  }

  async removeByMenuSectionId(
    menuSectionId: string,
    userId: string,
    userRole: string,
  ) {
    const menuSection = await this.menuSectionModel
      .findOne({ menuSectionId })
      .exec();

    if (!menuSection) {
      throw new NotFoundException(
        `Menu section with ID "${menuSectionId}" not found`,
      );
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      menuSection.restaurantId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this menu section',
      );
    }

    await this.menuSectionModel.findOneAndDelete({ menuSectionId }).exec();
  }

  private async generateMenuSectionId(): Promise<string> {
    const lastMenuSection = await this.menuSectionModel
      .findOne({}, { menuSectionId: 1 })
      .sort({ menuSectionId: -1 })
      .exec();

    if (!lastMenuSection) {
      return 'MSC-000001';
    }

    const lastId = lastMenuSection.menuSectionId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;

    return `MSC-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
