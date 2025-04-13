// src/menu-sections/dto/query-menu-section.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class QueryMenuSectionDto {
  @ApiPropertyOptional({
    description: 'Filter by section title',
    example: 'Breakfast',
  })
  @IsString()
  @IsOptional()
  title?: string;

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
