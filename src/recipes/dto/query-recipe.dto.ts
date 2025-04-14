// ./src/recipes/dto/query-recipe.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryRecipeDto {
  @ApiPropertyOptional({
    description: 'Filter by recipe name',
    example: 'Cake',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by ingredient ID',
    example: 'ING-000001',
  })
  @IsString()
  @IsOptional()
  ingredientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by equipment ID',
    example: 'EQP-000001',
  })
  @IsString()
  @IsOptional()
  equipmentId?: string;

  @ApiPropertyOptional({
    description: 'Maximum prep time in minutes',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  maxPrepTime?: number;

  @ApiPropertyOptional({
    description: 'Filter by restaurant ID',
    example: 'RST-000001',
  })
  @IsString()
  @IsOptional()
  restaurantId?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsOptional()
  limit?: number = 10;
}
