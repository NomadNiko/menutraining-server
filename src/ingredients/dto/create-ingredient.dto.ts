import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({
    description: 'Ingredient name',
    example: 'Onion',
  })
  @IsString()
  @IsNotEmpty()
  ingredientName: string;

  @ApiProperty({
    description: 'List of allergy IDs associated with this ingredient',
    example: ['ALG-000001', 'ALG-000002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ingredientAllergies: string[];

  @ApiPropertyOptional({
    description: 'URL for the ingredient image',
    example: 'https://example.com/images/onion.jpg',
  })
  @IsString()
  @IsOptional()
  ingredientImageUrl?: string;

  @ApiPropertyOptional({
    description: 'List of sub-ingredient IDs',
    example: ['ING-000002', 'ING-000003'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subIngredients?: string[];
}
