// ./menutraining-server/src/equipment/dto/create-equipment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'Equipment name',
    example: 'Blender',
  })
  @IsString()
  @IsNotEmpty()
  equipmentName: string;

  @ApiPropertyOptional({
    description: 'URL for the equipment image',
    example: 'https://example.com/images/blender.jpg',
  })
  @IsString()
  @IsOptional()
  equipmentImageUrl?: string;
}
