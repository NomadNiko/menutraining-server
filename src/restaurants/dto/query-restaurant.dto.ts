import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryRestaurantDto {
  @ApiPropertyOptional({
    description: 'Filter by restaurant name',
    example: 'Tasty',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsOptional()
  limit?: number = 10;
}
