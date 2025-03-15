import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryAllergyDto {
  @ApiPropertyOptional({
    description: 'Filter by allergy name',
    example: 'Peanuts',
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
