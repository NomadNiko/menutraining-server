import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IngredientSchemaClass } from './ingredient.schema';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectModel(IngredientSchemaClass.name)
    private ingredientModel: Model<IngredientSchemaClass>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const ingredientId = await this.generateIngredientId();
    const createdIngredient = new this.ingredientModel({
      ...createIngredientDto,
      ingredientId,
    });
    const savedIngredient = await createdIngredient.save();
    return savedIngredient.toJSON();
  }

  async findAll(queryDto: QueryIngredientDto) {
    const { page = 1, limit = 10, name, allergyId } = queryDto;
    const filter: any = {};
    if (name) {
      filter.ingredientName = { $regex: name, $options: 'i' };
    }
    if (allergyId) {
      filter.ingredientAllergies = allergyId;
    }
    const ingredients = await this.ingredientModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return ingredients.map((ingredient) => ingredient.toJSON());
  }

  async findOne(id: string) {
    const ingredient = await this.ingredientModel.findById(id).exec();
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }
    return ingredient.toJSON();
  }

  async findByIngredientId(ingredientId: string) {
    const ingredient = await this.ingredientModel
      .findOne({ ingredientId })
      .exec();
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with ID "${ingredientId}" not found`,
      );
    }
    return ingredient.toJSON();
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto) {
    const updatedIngredient = await this.ingredientModel
      .findByIdAndUpdate(id, updateIngredientDto, { new: true })
      .exec();
    if (!updatedIngredient) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }
    return updatedIngredient.toJSON();
  }

  async remove(id: string) {
    const result = await this.ingredientModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Ingredient with ID "${id}" not found`);
    }
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
