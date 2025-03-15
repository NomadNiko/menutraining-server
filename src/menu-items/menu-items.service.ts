import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItemSchemaClass } from './menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItemSchemaClass.name)
    private menuItemModel: Model<MenuItemSchemaClass>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    const menuItemId = await this.generateMenuItemId();
    const createdMenuItem = new this.menuItemModel({
      ...createMenuItemDto,
      menuItemId,
    });
    const savedMenuItem = await createdMenuItem.save();
    return savedMenuItem.toJSON();
  }

  async findAll(queryDto: QueryMenuItemDto) {
    const { page = 1, limit = 10, ingredientId } = queryDto;
    const filter: any = {};
    if (ingredientId) {
      filter.menuItemIngredients = ingredientId;
    }
    const menuItems = await this.menuItemModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return menuItems.map((menuItem) => menuItem.toJSON());
  }

  async findOne(id: string) {
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    return menuItem.toJSON();
  }

  async findByMenuItemId(menuItemId: string) {
    const menuItem = await this.menuItemModel.findOne({ menuItemId }).exec();
    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID "${menuItemId}" not found`,
      );
    }
    return menuItem.toJSON();
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const updatedMenuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, { new: true })
      .exec();
    if (!updatedMenuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    return updatedMenuItem.toJSON();
  }

  async remove(id: string) {
    const result = await this.menuItemModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
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
