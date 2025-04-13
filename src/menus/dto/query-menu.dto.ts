// src/menus/dto/query-menu.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DayOfWeek } from '../menu.schema';

export class QueryMenuDto {
  @ApiPropertyOptional({
    description: 'Filter by menu name',
    example: 'Dinner',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by active day',
    example: 'saturday',
    enum: DayOfWeek,
  })
  @IsEnum(DayOfWeek)
  @IsOptional()
  activeDay?: DayOfWeek;

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
