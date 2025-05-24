// ./menutraining-server/src/menu-items/dto/create-menu-item.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({
    description: 'Menu item name',
    example: 'Nikos Chocolate Cake',
  })
  @IsString()
  @IsNotEmpty()
  menuItemName: string;

  @ApiProperty({
    description: 'Menu item description',
    example: 'Delicious chocolate cake with vanilla frosting',
  })
  @IsString()
  @IsOptional()
  menuItemDescription?: string;

  @ApiProperty({
    description: 'List of ingredient IDs used in this menu item',
    example: ['ING-000001', 'ING-000002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  menuItemIngredients: string[];

  @ApiPropertyOptional({
    description: 'URL for the menu item image',
    example: 'https://example.com/images/chocolate-cake.jpg',
  })
  @IsString()
  @IsOptional()
  menuItemUrl?: string;

  @ApiProperty({
    description: 'Restaurant ID this menu item belongs to',
    example: 'RST-000001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
