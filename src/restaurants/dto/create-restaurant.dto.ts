import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'Restaurant name',
    example: 'Tasty Bites',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Restaurant description',
    example: 'A family-friendly restaurant serving delicious meals.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Restaurant Location',
    example: 'Atlanta, GA',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Restaurant phone',
    example: '+1 (555) 123-4567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Restaurant email',
    example: 'contact@tastybites.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Restaurant website',
    example: 'https://www.tastybites.com',
  })
  @IsString()
  @IsOptional()
  website?: string;
}
