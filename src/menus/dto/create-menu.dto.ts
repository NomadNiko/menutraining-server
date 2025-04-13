import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DayOfWeek } from '../menu.schema';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Menu name',
    example: 'Weekend Dinner Menu',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Menu description',
    example: 'Available on weekends from 5pm to 10pm',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Days of the week when the menu is active',
    example: ['saturday', 'sunday'],
    enum: DayOfWeek,
    isArray: true,
  })
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  activeDays: DayOfWeek[];

  @ApiPropertyOptional({
    description: 'Start time of the menu (format: HH:MM)',
    example: '17:00',
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time of the menu (format: HH:MM)',
    example: '22:00',
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'List of menu section IDs included in this menu',
    example: ['MSC-000001', 'MSC-000002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  menuSections: string[];

  @ApiProperty({
    description: 'Restaurant ID this menu belongs to',
    example: 'RST-000001',
  })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
