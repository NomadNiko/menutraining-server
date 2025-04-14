// ./src/recipes/recipes.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecipeSchemaClass } from './recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { RoleEnum } from '../roles/roles.enum';

interface IngredientDetail {
  id: string;
  name: string;
}

interface EquipmentDetail {
  id: string;
  name: string;
}

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(RecipeSchemaClass.name)
    private recipeModel: Model<RecipeSchemaClass>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(
    createRecipeDto: CreateRecipeDto,
    userId: string,
    userRole: string,
  ): Promise<RecipeSchemaClass> {
    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      createRecipeDto.restaurantId,
      userRole,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this restaurant');
    }

    // Set the order for each step if not provided
    if (createRecipeDto.recipeSteps && createRecipeDto.recipeSteps.length > 0) {
      createRecipeDto.recipeSteps.forEach((step, index) => {
        if (step.order === undefined) {
          step.order = index;
        }
      });
    }

    const recipeId = await this.generateRecipeId();
    const createdRecipe = new this.recipeModel({
      ...createRecipeDto,
      recipeId,
    });
    const savedRecipe = await createdRecipe.save();
    return savedRecipe.toJSON();
  }

  async findAll(
    queryDto: QueryRecipeDto,
    userId: string,
    userRole: string,
  ): Promise<RecipeSchemaClass[]> {
    const {
      page = 1,
      limit = 10,
      name,
      ingredientId,
      equipmentId,
      maxPrepTime,
      restaurantId,
    } = queryDto;

    // Build filter based on provided parameters
    const filter: Record<string, unknown> = {};

    if (name) {
      filter.recipeName = { $regex: name, $options: 'i' };
    }

    if (maxPrepTime !== undefined) {
      filter.recipePrepTime = { $lte: maxPrepTime };
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
      // If no restaurantId provided, for non-admin users, only show recipes for restaurants they have access to
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

    // Handle ingredient and equipment filtering with a more complex query
    if (ingredientId) {
      filter['recipeSteps.stepIngredientItems.ingredientId'] = ingredientId;
    }

    if (equipmentId) {
      filter['recipeSteps.stepEquipment'] = equipmentId;
    }

    const recipes = await this.recipeModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return recipes.map((recipe) => recipe.toJSON());
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<RecipeSchemaClass> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        recipe.restaurantId,
        userRole,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this recipe');
      }
    }

    return recipe.toJSON();
  }

  async findByRecipeId(
    recipeId: string,
    userId: string,
    userRole: string,
  ): Promise<RecipeSchemaClass> {
    const recipe = await this.recipeModel.findOne({ recipeId }).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${recipeId}" not found`);
    }

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
        userId,
        recipe.restaurantId,
        userRole,
      );
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this recipe');
      }
    }

    return recipe.toJSON();
  }

  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    userId: string,
    userRole: string,
  ): Promise<RecipeSchemaClass> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      recipe.restaurantId,
      userRole,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to update this recipe',
      );
    }

    // Prevent changing the restaurant ID
    if (
      updateRecipeDto.restaurantId &&
      updateRecipeDto.restaurantId !== recipe.restaurantId
    ) {
      throw new ForbiddenException(
        'Cannot change the restaurant of an existing recipe',
      );
    }

    // Update step orders if needed
    if (updateRecipeDto.recipeSteps && updateRecipeDto.recipeSteps.length > 0) {
      updateRecipeDto.recipeSteps.forEach((step, index) => {
        if (step.order === undefined) {
          step.order = index;
        }
      });
    }

    const updatedRecipe = await this.recipeModel
      .findByIdAndUpdate(id, updateRecipeDto, { new: true })
      .exec();

    if (!updatedRecipe) {
      throw new NotFoundException(
        `Recipe with ID "${id}" not found after update`,
      );
    }

    return updatedRecipe.toJSON();
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const recipe = await this.recipeModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }

    // Check restaurant access
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      userId,
      recipe.restaurantId,
      userRole,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to delete this recipe',
      );
    }

    await this.recipeModel.findByIdAndDelete(id).exec();
  }

  private async generateRecipeId(): Promise<string> {
    const lastRecipe = await this.recipeModel
      .findOne({}, { recipeId: 1 })
      .sort({ recipeId: -1 })
      .exec();

    if (!lastRecipe) {
      return 'RCP-000001';
    }

    const lastId = lastRecipe.recipeId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;
    return `RCP-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
