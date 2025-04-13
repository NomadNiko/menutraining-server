// ./menutraining-server/src/equipment/dto/query-equipment.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryEquipmentDto {
  @ApiPropertyOptional({
    description: 'Filter by equipment name',
    example: 'Blender',
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
