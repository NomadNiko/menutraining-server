import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserRestaurantDto {
  @ApiProperty({
    description: 'User ID to associate with restaurant',
    example: '60d5f8b7b54a12d6c4e0f7a1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
