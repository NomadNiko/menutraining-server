import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAllergyDto {
  @ApiProperty({
    description: 'Allergy name',
    example: 'Peanuts',
  })
  @IsString()
  @IsNotEmpty()
  allergyName: string;

  @ApiPropertyOptional({
    description: 'URL for the allergy logo',
    example: 'https://example.com/logos/peanut.jpg',
  })
  @IsString()
  @IsOptional()
  allergyLogoUrl?: string;
}
