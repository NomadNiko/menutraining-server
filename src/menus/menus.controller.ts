// src/menus/menus.controller.ts
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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { MenuSchemaClass } from './menu.schema';

@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'menus',
  version: '1',
})
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The menu has been successfully created.',
    type: MenuSchemaClass,
  })
  create(
    @Body() createMenuDto: CreateMenuDto,
    @Request() req,
  ): Promise<MenuSchemaClass> {
    return this.menusService.create(
      createMenuDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all menus with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all menus.',
    type: [MenuSchemaClass],
  })
  findAll(
    @Query() query: QueryMenuDto,
    @Request() req,
  ): Promise<MenuSchemaClass[]> {
    return this.menusService.findAll(query, req.user.id, req.user.role.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiParam({ name: 'id', description: 'Menu ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the menu.',
    type: MenuSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu not found.',
  })
  findOne(@Param('id') id: string, @Request() req): Promise<MenuSchemaClass> {
    return this.menusService.findOne(id, req.user.id, req.user.role.id);
  }

  @Get('code/:menuId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu by menu ID (MNU-XXXXXX)' })
  @ApiParam({
    name: 'menuId',
    description: 'Menu ID (MNU-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the menu.',
    type: MenuSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu not found.',
  })
  findByMenuId(
    @Param('menuId') menuId: string,
    @Request() req,
  ): Promise<MenuSchemaClass> {
    return this.menusService.findByMenuId(
      menuId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The menu has been successfully updated.',
    type: MenuSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req,
  ): Promise<MenuSchemaClass> {
    return this.menusService.update(
      id,
      updateMenuDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu' })
  @ApiParam({ name: 'id', description: 'Menu ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The menu has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu not found.',
  })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.menusService.remove(id, req.user.id, req.user.role.id);
  }
}
