// src/menu-sections/dto/create-menu-section.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateSectionItemDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: 'MID-000001',
  })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    description: 'Name of the item in this section',
    example: 'Classic Burger',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Custom description for this item in the section',
    example: 'Our signature burger with special sauce',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Price of the item in this section',
    example: 12.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({
    description: 'Custom image URL for this item in the section',
    example: 'https://example.com/images/classic-burger.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Order of the item in the section (0-based)',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateMenuSectionDto {
  @ApiProperty({
    description: 'Title of the menu section',
    example: 'Breakfast',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the menu section',
    example: 'Available daily from 7am to 11am',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Start time of the section (format: HH:MM)',
    example: '07:00',
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time of the section (format: HH:MM)',
    example: '11:00',
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Section items',
    type: [CreateSectionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionItemDto)
  items: CreateSectionItemDto[];

  @ApiProperty({
    description: 'Restaurant ID this menu section belongs to',
    example: 'RST-000001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
