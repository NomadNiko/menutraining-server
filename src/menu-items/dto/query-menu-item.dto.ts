// ./menutraining-server/src/menu-items/dto/query-menu-item.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryMenuItemDto {
  @ApiPropertyOptional({
    description: 'Filter by ingredient ID',
    example: 'ING-000001',
  })
  @IsString()
  @IsOptional()
  ingredientId?: string;

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
