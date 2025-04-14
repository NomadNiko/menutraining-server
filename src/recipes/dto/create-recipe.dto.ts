// ./src/recipes/dto/create-recipe.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateStepIngredientItemDto {
  @ApiProperty({
    description: 'Ingredient ID',
    example: 'ING-000001',
  })
  @IsString()
  @IsNotEmpty()
  ingredientId: string;

  @ApiPropertyOptional({
    description: 'Measurement type (e.g., grams, cups, etc.)',
    example: 'grams',
  })
  @IsString()
  @IsOptional()
  ingredientMeasure?: string;

  @ApiProperty({
    description: 'Amount of ingredient',
    example: 200,
  })
  @IsNumber()
  @IsPositive()
  ingredientUnits: number;
}

export class CreateRecipeStepItemDto {
  @ApiProperty({
    description: 'Text description of the step',
    example: 'Mix the flour and water',
  })
  @IsString()
  @IsNotEmpty()
  stepText: string;

  @ApiPropertyOptional({
    description: 'Equipment IDs needed for this step',
    example: ['EQP-000001', 'EQP-000002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  stepEquipment?: string[];

  @ApiPropertyOptional({
    description: 'Ingredients used in this step',
    type: [CreateStepIngredientItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepIngredientItemDto)
  @IsOptional()
  stepIngredientItems?: CreateStepIngredientItemDto[];

  @ApiPropertyOptional({
    description: 'URL for step image',
    example: 'https://example.com/images/step1.jpg',
  })
  @IsString()
  @IsOptional()
  stepImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Order position of this step (0-based)',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Classic Chocolate Cake',
  })
  @IsString()
  @IsNotEmpty()
  recipeName: string;

  @ApiPropertyOptional({
    description: 'Recipe description',
    example: 'A rich and moist chocolate cake perfect for any occasion',
  })
  @IsString()
  @IsOptional()
  recipeDescription?: string;

  @ApiPropertyOptional({
    description: 'URL for recipe image',
    example: 'https://example.com/images/chocolate-cake.jpg',
  })
  @IsString()
  @IsOptional()
  recipeImageUrl?: string;

  @ApiProperty({
    description: 'Number of servings this recipe makes',
    example: 8,
  })
  @IsNumber()
  @IsPositive()
  recipeServings: number;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  recipePrepTime: number;

  @ApiProperty({
    description: 'Total time in minutes (including preparation and cooking)',
    example: 45,
  })
  @IsNumber()
  @Min(0)
  recipeTotalTime: number;

  @ApiProperty({
    description: 'Recipe steps',
    type: [CreateRecipeStepItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepItemDto)
  recipeSteps: CreateRecipeStepItemDto[];

  @ApiProperty({
    description: 'Restaurant ID this recipe belongs to',
    example: 'RST-000001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
