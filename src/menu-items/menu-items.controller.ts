// ./menutraining-server/src/menu-items/menu-items.controller.ts
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
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { QueryMenuItemDto } from './dto/query-menu-item.dto';

@ApiTags('Menu Items')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'menu-items',
  version: '1',
})
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The menu item has been successfully created.',
  })
  create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
    return this.menuItemsService.create(
      createMenuItemDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all menu items with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all menu items.' })
  findAll(@Query() query: QueryMenuItemDto, @Request() req) {
    return this.menuItemsService.findAll(query, req.user.id, req.user.role.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu Item ID (MongoDB ObjectId)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the menu item.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found.',
  })
  findOne(@Param('id') id: string, @Request() req) {
    return this.menuItemsService.findOne(id, req.user.id, req.user.role.id);
  }

  @Get('code/:menuItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu item by menu item ID (MID-XXXXXX)' })
  @ApiParam({
    name: 'menuItemId',
    description: 'Menu Item ID (MID-XXXXXX pattern)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the menu item.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found.',
  })
  findByMenuItemId(@Param('menuItemId') menuItemId: string, @Request() req) {
    return this.menuItemsService.findByMenuItemId(
      menuItemId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'id', description: 'Menu Item ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The menu item has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @Request() req,
  ) {
    return this.menuItemsService.update(
      id,
      updateMenuItemDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiParam({ name: 'id', description: 'Menu Item ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The menu item has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu item not found.',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.menuItemsService.remove(id, req.user.id, req.user.role.id);
  }
}
