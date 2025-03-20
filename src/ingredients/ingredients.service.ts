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
    const { page = 1, limit = 10, name, allergyId, restaurantId } = queryDto;
    const filter: any = {};

    if (name) {
      filter.ingredientName = { $regex: name, $options: 'i' };
    }

    if (allergyId) {
      filter.ingredientAllergies = allergyId;
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
      // If no restaurantId provided, for non-admin users, only show ingredients for restaurants they have access to
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

    const ingredients = await this.ingredientModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return ingredients.map((ingredient) => ingredient.toJSON());
  }

  async findOne(id: string, userId: string, userRole: string) {
    const ingredient = await this.ingredientModel.findById(id).exec();

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
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

    return ingredient.toJSON();
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

    // Check restaurant access if not an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
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

    return ingredient.toJSON();
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

    // Check restaurant access
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

    return updatedIngredient.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    const ingredient = await this.ingredientModel.findById(id).exec();

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }

    // Check restaurant access
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

    await this.ingredientModel.findByIdAndDelete(id).exec();
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
