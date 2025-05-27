// ./menutraining-server/src/menu-items/menu-items.service.ts
// src/menu-items/menu-items.service.ts
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
import { IngredientSchemaClass } from '../ingredients/ingredient.schema';
import { AllergySchemaClass } from '../allergies/allergy.schema';
import { IngredientsService } from '../ingredients/ingredients.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItemSchemaClass.name)
    private menuItemModel: Model<MenuItemSchemaClass>,
    @InjectModel(IngredientSchemaClass.name)
    private ingredientModel: Model<IngredientSchemaClass>,
    @InjectModel(AllergySchemaClass.name)
    private allergyModel: Model<AllergySchemaClass>,
    private restaurantsService: RestaurantsService,
    private ingredientsService: IngredientsService,
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

    // Enhance with additional data before returning
    const enhancedItems = await this.enhanceMenuItems([savedMenuItem]);
    return enhancedItems[0];
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
      // If no restaurantId provided, for non-admin users, only show menu items for restaurants they have access to
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

    const menuItems = await this.menuItemModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Enhance menu items with ingredient names and allergies
    return await this.enhanceMenuItems(menuItems);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
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

    // Enhance menu item with ingredient names and allergies
    const enhancedItems = await this.enhanceMenuItems([menuItem]);
    return enhancedItems[0];
  }

  async findByMenuItemId(menuItemId: string, userId: string, userRole: string) {
    const menuItem = await this.menuItemModel.findOne({ menuItemId }).exec();
    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID "${menuItemId}" not found`,
      );
    }

    // Check restaurant access if not an admin
    if (String(userRole) !== String(RoleEnum.admin)) {
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

    // Enhance menu item with ingredient names and allergies
    const enhancedItems = await this.enhanceMenuItems([menuItem]);
    return enhancedItems[0];
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

    // Enhance the updated menu item with ingredient names and allergies
    const enhancedItems = await this.enhanceMenuItems([updatedMenuItem]);
    return enhancedItems[0];
  }

  async updateByMenuItemId(
    menuItemId: string,
    updateMenuItemDto: UpdateMenuItemDto,
    userId: string,
    userRole: string,
  ) {
    const menuItem = await this.menuItemModel.findOne({ menuItemId }).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${menuItemId}" not found`);
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
      .findOneAndUpdate({ menuItemId }, updateMenuItemDto, { new: true })
      .exec();

    if (!updatedMenuItem) {
      throw new NotFoundException(
        `Menu item with ID "${menuItemId}" not found after update`,
      );
    }

    // Enhance the updated menu item with ingredient names and allergies
    const enhancedItems = await this.enhanceMenuItems([updatedMenuItem]);
    return enhancedItems[0];
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

  async removeByMenuItemId(
    menuItemId: string,
    userId: string,
    userRole: string,
  ) {
    const menuItem = await this.menuItemModel.findOne({ menuItemId }).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID "${menuItemId}" not found`);
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

    await this.menuItemModel.findOneAndDelete({ menuItemId }).exec();
  }

  // Enhanced method to provide detailed information about menu items
  // Updated to handle cross-restaurant ingredient lookups
  private async enhanceMenuItems(menuItems: any[]): Promise<any[]> {
    if (menuItems.length === 0) {
      return [];
    }

    // Get all unique ingredient IDs from menu items
    const ingredientIds = Array.from(
      new Set(menuItems.flatMap((item) => item.menuItemIngredients)),
    );

    if (ingredientIds.length === 0) {
      return menuItems.map((item) => (item.toJSON ? item.toJSON() : item));
    }

    // Fetch all ingredients in a single query - no restaurant restriction
    // This allows menu items to reference both core and restaurant-specific ingredients
    const ingredients = await this.ingredientModel
      .find({ ingredientId: { $in: ingredientIds } })
      .exec();

    // Create lookup maps for ingredients
    const ingredientMap: Record<string, string> = {};
    const ingredientToAllergiesMap: Record<string, string[]> = {};

    // Batch optimization: Collect all sub-ingredient IDs from all ingredients
    const allSubIngredientIds = new Set<string>();
    ingredients.forEach((ingredient) => {
      if (ingredient.subIngredients && ingredient.subIngredients.length > 0) {
        ingredient.subIngredients.forEach((subId) =>
          allSubIngredientIds.add(subId),
        );
      }
    });

    // Fetch all sub-ingredients in a single query
    const subIngredientsMap = new Map<string, any>();
    if (allSubIngredientIds.size > 0) {
      const allSubIngredients = await this.ingredientModel
        .find({ ingredientId: { $in: Array.from(allSubIngredientIds) } })
        .exec();

      allSubIngredients.forEach((subIng) => {
        subIngredientsMap.set(subIng.ingredientId, subIng);
      });
    }

    // Build allergies cache for efficient lookup
    const allergiesCache = new Map<string, string[]>();

    // Helper function to get allergies with caching
    const getCachedAllergies = (
      ingredientId: string,
      visitedIngredients: Set<string> = new Set(),
    ): string[] => {
      if (allergiesCache.has(ingredientId)) {
        return allergiesCache.get(ingredientId)!;
      }

      if (visitedIngredients.has(ingredientId)) {
        return [];
      }

      visitedIngredients.add(ingredientId);

      // Find the ingredient (could be main or sub)
      const ing =
        ingredients.find((i) => i.ingredientId === ingredientId) ||
        subIngredientsMap.get(ingredientId);

      if (!ing) {
        return [];
      }

      const allergies = [...(ing.ingredientAllergies || [])];

      // Add allergies from sub-ingredients
      if (ing.subIngredients && ing.subIngredients.length > 0) {
        for (const subIngId of ing.subIngredients) {
          const subAllergies = getCachedAllergies(subIngId, visitedIngredients);
          subAllergies.forEach((allergyId) => {
            if (!allergies.includes(allergyId)) {
              allergies.push(allergyId);
            }
          });
        }
      }

      allergiesCache.set(ingredientId, allergies);
      return allergies;
    };

    // Process all ingredients with batch-fetched data
    for (const ingredient of ingredients) {
      ingredientMap[ingredient.ingredientId] = ingredient.ingredientName;
      // Get all allergies using cached function (no async/await needed)
      const allAllergies = getCachedAllergies(ingredient.ingredientId);
      ingredientToAllergiesMap[ingredient.ingredientId] = allAllergies;
    }

    // Collect all unique allergy IDs across all ingredients
    const allergyIds = Array.from(
      new Set(
        Object.values(ingredientToAllergiesMap).flatMap(
          (allergies) => allergies,
        ),
      ),
    );

    // Fetch allergy details if there are any
    let allergyMap: Record<string, string> = {};
    if (allergyIds.length > 0) {
      const allergies = await this.allergyModel
        .find({ allergyId: { $in: allergyIds } })
        .exec();
      allergyMap = allergies.reduce(
        (map, allergy) => {
          map[allergy.allergyId] = allergy.allergyName;
          return map;
        },
        {} as Record<string, string>,
      );
    }

    // Enhance menu items with ingredient names and allergies
    return menuItems.map((menuItem) => {
      // Get plain object
      const menuItemObj = menuItem.toJSON
        ? menuItem.toJSON()
        : JSON.parse(JSON.stringify(menuItem));

      // Add ingredient names array
      menuItemObj.ingredientNames = menuItemObj.menuItemIngredients.map(
        (id: string) => ingredientMap[id] || id,
      );

      // Collect all allergies from all ingredients
      const allergiesList: any[] = [];
      const seenAllergies = new Set();

      menuItemObj.menuItemIngredients.forEach((ingredientId: string) => {
        const ingredientAllergies =
          ingredientToAllergiesMap[ingredientId] || [];
        ingredientAllergies.forEach((allergyId: string) => {
          if (!seenAllergies.has(allergyId) && allergyMap[allergyId]) {
            seenAllergies.add(allergyId);
            allergiesList.push({
              id: allergyId,
              name: allergyMap[allergyId],
            });
          }
        });
      });

      menuItemObj.allergies = allergiesList;
      return menuItemObj;
    });
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
