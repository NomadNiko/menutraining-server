// ./menutraining-server/src/ingredients/ingredients.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IngredientSchemaClass } from './ingredient.schema';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RoleEnum } from '../roles/roles.enum';

// Add interface for sub-ingredient details
interface SubIngredientDetail {
  id: string;
  name: string;
}

// Constants for core restaurant
const CORE_RESTAURANT_ID = 'RST-000001';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectModel(IngredientSchemaClass.name)
    private ingredientModel: Model<IngredientSchemaClass>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(
    createIngredientDto: CreateIngredientDto,
    userId: string,
    userRole: string,
  ) {
    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      createIngredientDto.restaurantId,
      userRole,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    const ingredientId = await this.generateIngredientId();
    const createdIngredient = new this.ingredientModel({
      ...createIngredientDto,
      ingredientId,
    });

    const savedIngredient = await createdIngredient.save();
    return savedIngredient.toJSON();
  }

  async findAll(
    queryDto: QueryIngredientDto,
    userId: string,
    userRole: string,
  ) {
    const {
      page = 1,
      limit = 10,
      name,
      allergyId,
      category,
      restaurantId,
    } = queryDto;

    const filter: any = {};

    if (name) {
      filter.ingredientName = { $regex: name, $options: 'i' };
    }
    if (allergyId) {
      filter.ingredientAllergies = allergyId;
    }
    if (category) {
      filter.categories = category;
    }

    // Build restaurant filter to include core ingredients
    let restaurantFilter: any;

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

      // Include both core ingredients and restaurant-specific ingredients
      if (restaurantId === CORE_RESTAURANT_ID) {
        // If requesting core restaurant, only return core ingredients
        restaurantFilter = CORE_RESTAURANT_ID;
      } else {
        // For any other restaurant, include both core and restaurant-specific
        restaurantFilter = { $in: [CORE_RESTAURANT_ID, restaurantId] };
      }
    } else {
      // If no restaurantId provided, for non-admin users, show ingredients for restaurants they have access to + core
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
        const user =
          await this.restaurantsService['usersService'].findById(userId);
        if (
          !user ||
          !user.associatedRestaurants ||
          user.associatedRestaurants.length === 0
        ) {
          // Only show core ingredients if user has no restaurant associations
          restaurantFilter = CORE_RESTAURANT_ID;
        } else {
          // Include core ingredients plus user's associated restaurants
          const userRestaurants = [...user.associatedRestaurants];
          if (!userRestaurants.includes(CORE_RESTAURANT_ID)) {
            userRestaurants.push(CORE_RESTAURANT_ID);
          }
          restaurantFilter = { $in: userRestaurants };
        }
      } else {
        // Admin users see all ingredients (no filter)
        // Don't set restaurantFilter for admins without specific restaurantId
      }
    }

    // Apply restaurant filter if defined
    if (restaurantFilter) {
      filter.restaurantId = restaurantFilter;
    }

    const ingredients = await this.ingredientModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Batch optimization: Collect all sub-ingredient IDs first
    const allSubIngredientIds = new Set<string>();
    ingredients.forEach((ingredient) => {
      if (ingredient.subIngredients && ingredient.subIngredients.length > 0) {
        ingredient.subIngredients.forEach((subId) =>
          allSubIngredientIds.add(subId),
        );
      }
    });

    // Fetch all sub-ingredients in a single query
    const subIngredientsMap = new Map<string, IngredientSchemaClass>();
    if (allSubIngredientIds.size > 0) {
      const allSubIngredients = await this.ingredientModel
        .find({ ingredientId: { $in: Array.from(allSubIngredientIds) } })
        .exec();

      allSubIngredients.forEach((subIng) => {
        subIngredientsMap.set(subIng.ingredientId, subIng);
      });
    }

    // Build allergies map for all ingredients (including sub-ingredients)
    const allergiesCache = new Map<string, string[]>();

    // Helper function to get allergies with caching
    const getCachedAllergies = async (
      ingredientId: string,
      visitedIngredients: Set<string> = new Set(),
    ): Promise<string[]> => {
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
          const subAllergies = await getCachedAllergies(
            subIngId,
            visitedIngredients,
          );
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

    // Process all ingredients with the pre-fetched data
    const enhancedIngredients = await Promise.all(
      ingredients.map(async (ingredient) => {
        const ingredientObj = ingredient.toJSON();

        // Get all allergies using cached function
        const allAllergies = await getCachedAllergies(
          ingredient.ingredientId,
        );

        // Derived allergies are those not directly on the ingredient
        const derivedAllergies = allAllergies.filter(
          (allergyId) => !ingredient.ingredientAllergies.includes(allergyId),
        );

        // Build sub-ingredient details from pre-fetched map
        const subIngredientDetails: SubIngredientDetail[] = [];
        if (
          ingredient.subIngredients &&
          ingredient.subIngredients.length > 0
        ) {
          ingredient.subIngredients.forEach((subId) => {
            const subIng = subIngredientsMap.get(subId);
            if (subIng) {
              subIngredientDetails.push({
                id: subIng.ingredientId,
                name: subIng.ingredientName,
              });
            }
          });
        }

        return {
          ...ingredientObj,
          derivedAllergies,
          subIngredientDetails,
          // Add indicator for core ingredients
          isCoreIngredient: ingredient.restaurantId === CORE_RESTAURANT_ID,
        };
      }),
    );

    return enhancedIngredients;
  }

  async findOne(id: string, userId: string, userRole: string) {
    const ingredient = await this.ingredientModel.findById(id).exec();
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    // Check access - allow access to core ingredients for all users
    if (ingredient.restaurantId !== CORE_RESTAURANT_ID) {
      // Check restaurant access if not an admin and not a core ingredient
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
        const hasAccess =
          await this.restaurantsService.checkUserRestaurantAccess(
            userId,
            ingredient.restaurantId,
            userRole,
          );
        if (!hasAccess) {
          throw new ForbiddenException(
            'You do not have access to this ingredient',
          );
        }
      }
    }

    // Get derived allergies and sub-ingredient details
    const derivedAllergies = await this.getAllDerivedAllergies(
      ingredient.ingredientId,
    );
    const subIngredientDetails = await this.getSubIngredientDetails(
      ingredient.ingredientId,
    );

    const ingredientObj = ingredient.toJSON();
    return {
      ...ingredientObj,
      derivedAllergies: derivedAllergies.filter(
        (allergyId) => !ingredient.ingredientAllergies.includes(allergyId),
      ),
      subIngredientDetails,
      isCoreIngredient: ingredient.restaurantId === CORE_RESTAURANT_ID,
    };
  }

  async findByIngredientId(
    ingredientId: string,
    userId: string,
    userRole: string,
  ) {
    const ingredient = await this.ingredientModel
      .findOne({ ingredientId })
      .exec();
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID "${ingredientId}" not found`,
      );
    }

    // Check access - allow access to core ingredients for all users
    if (ingredient.restaurantId !== CORE_RESTAURANT_ID) {
      // Check restaurant access if not an admin and not a core ingredient
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
        const hasAccess =
          await this.restaurantsService.checkUserRestaurantAccess(
            userId,
            ingredient.restaurantId,
            userRole,
          );
        if (!hasAccess) {
          throw new ForbiddenException(
            'You do not have access to this ingredient',
          );
        }
      }
    }

    // Get derived allergies and sub-ingredient details
    const derivedAllergies = await this.getAllDerivedAllergies(
      ingredient.ingredientId,
    );
    const subIngredientDetails = await this.getSubIngredientDetails(
      ingredient.ingredientId,
    );

    const ingredientObj = ingredient.toJSON();
    return {
      ...ingredientObj,
      derivedAllergies: derivedAllergies.filter(
        (allergyId) => !ingredient.ingredientAllergies.includes(allergyId),
      ),
      subIngredientDetails,
      isCoreIngredient: ingredient.restaurantId === CORE_RESTAURANT_ID,
    };
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
    userId: string,
    userRole: string,
  ) {
    const ingredient = await this.ingredientModel.findById(id).exec();
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    // Prevent updating core ingredients unless admin
    if (ingredient.restaurantId === CORE_RESTAURANT_ID) {
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
        throw new ForbiddenException(
          'Only administrators can update core ingredients',
        );
      }
    } else {
      // Check restaurant access for non-core ingredients
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        ingredient.restaurantId,
        userRole,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to update this ingredient',
        );
      }
    }

    // Prevent changing the restaurant ID
    if (
      updateIngredientDto.restaurantId &&
      updateIngredientDto.restaurantId !== ingredient.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing ingredient',
      );
    }

    const updatedIngredient = await this.ingredientModel
      .findByIdAndUpdate(id, updateIngredientDto, { new: true })
      .exec();

    if (!updatedIngredient) {
      throw new NotFoundException(
        `Ingredient with ID "${id}" not found after update`,
      );
    }

    // Get derived allergies and sub-ingredient details
    const derivedAllergies = await this.getAllDerivedAllergies(
      updatedIngredient.ingredientId,
    );
    const subIngredientDetails = await this.getSubIngredientDetails(
      updatedIngredient.ingredientId,
    );

    const ingredientObj = updatedIngredient.toJSON();
    return {
      ...ingredientObj,
      derivedAllergies: derivedAllergies.filter(
        (allergyId) =>
          !updatedIngredient.ingredientAllergies.includes(allergyId),
      ),
      subIngredientDetails,
      isCoreIngredient: updatedIngredient.restaurantId === CORE_RESTAURANT_ID,
    };
  }

  async remove(id: string, userId: string, userRole: string) {
    const ingredient = await this.ingredientModel.findById(id).exec();
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    // Prevent deleting core ingredients unless admin
    if (ingredient.restaurantId === CORE_RESTAURANT_ID) {
      if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
        throw new ForbiddenException(
          'Only administrators can delete core ingredients',
        );
      }
    } else {
      // Check restaurant access for non-core ingredients
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        ingredient.restaurantId,
        userRole,
      );
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to delete this ingredient',
        );
      }
    }

    await this.ingredientModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get all allergies for an ingredient, including those derived from sub-ingredients
   * Updated to handle cross-restaurant sub-ingredient lookups
   * @param ingredientId The ID of the ingredient to check
   * @param visitedIngredients Set of already visited ingredients to prevent circular references
   * @returns Array of allergy IDs
   */
  async getAllAllergies(
    ingredientId: string,
    visitedIngredients: Set<string> = new Set(),
  ): Promise<string[]> {
    // Prevent circular references
    if (visitedIngredients.has(ingredientId)) {
      return [];
    }

    // Mark this ingredient as visited
    visitedIngredients.add(ingredientId);

    // Get the ingredient - no restaurant restriction for sub-ingredient lookups
    const ingredient = await this.ingredientModel
      .findOne({ ingredientId })
      .exec();

    if (!ingredient) {
      return [];
    }

    // Start with direct allergies
    const allergies = [...ingredient.ingredientAllergies];

    // Add allergies from sub-ingredients
    if (ingredient.subIngredients && ingredient.subIngredients.length > 0) {
      for (const subIngredientId of ingredient.subIngredients) {
        const subAllergies = await this.getAllAllergies(
          subIngredientId,
          visitedIngredients,
        );
        // Add unique allergies
        subAllergies.forEach((allergyId) => {
          if (!allergies.includes(allergyId)) {
            allergies.push(allergyId);
          }
        });
      }
    }

    return allergies;
  }

  /**
   * Get only derived allergies from sub-ingredients, not including direct allergies
   * @param ingredientId The ID of the ingredient to check
   * @returns Array of derived allergy IDs
   */
  async getAllDerivedAllergies(ingredientId: string): Promise<string[]> {
    const allAllergies = await this.getAllAllergies(ingredientId);
    const ingredient = await this.ingredientModel
      .findOne({ ingredientId })
      .exec();

    if (!ingredient) {
      return allAllergies;
    }

    // Filter out direct allergies to get only derived ones
    return allAllergies.filter(
      (allergyId) => !ingredient.ingredientAllergies.includes(allergyId),
    );
  }

  /**
   * Get sub-ingredient details including names and IDs
   * Updated to handle cross-restaurant sub-ingredient lookups
   * @param ingredientId The ID of the ingredient
   * @returns Array of sub-ingredient details
   */
  async getSubIngredientDetails(
    ingredientId: string,
  ): Promise<SubIngredientDetail[]> {
    const ingredient = await this.ingredientModel
      .findOne({ ingredientId })
      .exec();

    if (
      !ingredient ||
      !ingredient.subIngredients ||
      ingredient.subIngredients.length === 0
    ) {
      return [];
    }

    // Fetch all sub-ingredients in a single query - no restaurant restriction
    const subIngredients = await this.ingredientModel
      .find({ ingredientId: { $in: ingredient.subIngredients } })
      .exec();

    // Map to include both ID and name
    return subIngredients.map((subIngredient) => ({
      id: subIngredient.ingredientId,
      name: subIngredient.ingredientName,
    }));
  }

  private async generateIngredientId(): Promise<string> {
    const lastIngredient = await this.ingredientModel
      .findOne({}, { ingredientId: 1 })
      .sort({ ingredientId: -1 })
      .exec();

    if (!lastIngredient) {
      return 'ING-000001';
    }

    const lastId = lastIngredient.ingredientId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;
    return `ING-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
