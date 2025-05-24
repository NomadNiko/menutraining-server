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
import { MenuSectionsService } from './menu-sections.service';
import { CreateMenuSectionDto } from './dto/create-menu-section.dto';
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto';
import { QueryMenuSectionDto } from './dto/query-menu-section.dto';
import { MenuSectionSchemaClass } from './menu-section.schema';

@ApiTags('Menu Sections')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'menu-sections',
  version: '1',
})
export class MenuSectionsController {
  constructor(private readonly menuSectionsService: MenuSectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new menu section' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The menu section has been successfully created.',
    type: MenuSectionSchemaClass,
  })
  create(
    @Body() createMenuSectionDto: CreateMenuSectionDto,
    @Request() req,
  ): Promise<MenuSectionSchemaClass> {
    return this.menuSectionsService.create(
      createMenuSectionDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all menu sections with filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all menu sections.',
    type: [MenuSectionSchemaClass],
  })
  findAll(
    @Query() query: QueryMenuSectionDto,
    @Request() req,
  ): Promise<MenuSectionSchemaClass[]> {
    return this.menuSectionsService.findAll(
      query,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu section by ID' })
  @ApiParam({ name: 'id', description: 'Menu Section ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the menu section.',
    type: MenuSectionSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu section not found.',
  })
  findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<MenuSectionSchemaClass> {
    return this.menuSectionsService.findOne(id, req.user.id, req.user.role.id);
  }

  @Get('code/:menuSectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get menu section by menu section ID (MSC-XXXXXX)' })
  @ApiParam({
    name: 'menuSectionId',
    description: 'Menu Section ID (MSC-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the menu section.',
    type: MenuSectionSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu section not found.',
  })
  findByMenuSectionId(
    @Param('menuSectionId') menuSectionId: string,
    @Request() req,
  ): Promise<MenuSectionSchemaClass> {
    return this.menuSectionsService.findByMenuSectionId(
      menuSectionId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a menu section' })
  @ApiParam({ name: 'id', description: 'Menu Section ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The menu section has been successfully updated.',
    type: MenuSectionSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu section not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateMenuSectionDto: UpdateMenuSectionDto,
    @Request() req,
  ): Promise<MenuSectionSchemaClass> {
    return this.menuSectionsService.update(
      id,
      updateMenuSectionDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a menu section' })
  @ApiParam({ name: 'id', description: 'Menu Section ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The menu section has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Menu section not found.',
  })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.menuSectionsService.remove(id, req.user.id, req.user.role.id);
  }
}
