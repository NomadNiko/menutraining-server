import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { QueryRestaurantDto } from './dto/query-restaurant.dto';
import { UserRestaurantDto } from './dto/user-restaurant.dto';
import { RestaurantSchemaClass } from './restaurant.schema';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RestaurantAccessGuard } from './guards/restaurant-access.guard';
import { User } from '../users/domain/user';

@ApiTags('Restaurants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'restaurants',
  version: '1',
})
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The restaurant has been successfully created.',
    type: RestaurantSchemaClass,
  })
  create(@Body() createRestaurantDto: CreateRestaurantDto, @Request() req) {
    // Fixed: removed the third argument that wasn't expected
    return this.restaurantsService.create(createRestaurantDto, req.user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all restaurants with filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all restaurants.',
    type: [RestaurantSchemaClass],
  })
  findAll(@Query() query: QueryRestaurantDto, @Request() req) {
    return this.restaurantsService.findAll(
      query,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get(':restaurantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get restaurant by restaurant ID (RES-XXXXXX)' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RES-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the restaurant.',
    type: RestaurantSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurant not found.',
  })
  findOne(@Param('restaurantId') restaurantId: string) {
    return this.restaurantsService.findByRestaurantId(restaurantId);
  }

  @Patch(':restaurantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RES-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The restaurant has been successfully updated.',
    type: RestaurantSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurant not found.',
  })
  update(
    @Param('restaurantId') restaurantId: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ) {
    return this.restaurantsService.updateByRestaurantId(
      restaurantId,
      updateRestaurantDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':restaurantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RES-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The restaurant has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurant not found.',
  })
  remove(@Param('restaurantId') restaurantId: string, @Request() req) {
    return this.restaurantsService.removeByRestaurantId(
      restaurantId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Post(':restaurantId/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a user to a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RST-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully added to the restaurant.',
    type: RestaurantSchemaClass,
  })
  addUserToRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Body() userRestaurantDto: UserRestaurantDto,
    @Request() req,
  ) {
    return this.restaurantsService.addUserToRestaurant(
      restaurantId,
      userRestaurantDto.userId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':restaurantId/users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a user from a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RST-XXXXXX pattern)',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to remove',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully removed from the restaurant.',
    type: RestaurantSchemaClass,
  })
  removeUserFromRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.restaurantsService.removeUserFromRestaurant(
      restaurantId,
      userId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get(':restaurantId/users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users for a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID (RST-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all users for the restaurant.',
    type: [User],
  })
  getUsersForRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Request() req,
  ) {
    return this.restaurantsService.getUsersForRestaurant(
      restaurantId,
      req.user.id,
      req.user.role.id,
    );
  }
}
