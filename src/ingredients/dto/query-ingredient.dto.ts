import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryIngredientDto {
  @ApiPropertyOptional({
    description: 'Filter by ingredient name',
    example: 'Onion',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by allergy ID',
    example: 'ALG-000001',
  })
  @IsString()
  @IsOptional()
  allergyId?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsOptional()
  limit?: number = 10;
}
