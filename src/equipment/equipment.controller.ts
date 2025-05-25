// ./menutraining-server/src/equipment/equipment.controller.ts
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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { EquipmentSchemaClass } from './equipment.schema';

@ApiTags('Equipment')
@Controller({
  path: 'equipment',
  version: '1',
})
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new equipment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The equipment has been successfully created.',
    type: EquipmentSchemaClass,
  })
  create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @Request() req,
  ): Promise<EquipmentSchemaClass> {
    return this.equipmentService.create(
      createEquipmentDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all equipment with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all equipment.',
    type: [EquipmentSchemaClass],
  })
  findAll(@Query() query: QueryEquipmentDto): Promise<{
    data: EquipmentSchemaClass[];
    hasNextPage: boolean;
  }> {
    return this.equipmentService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiParam({ name: 'id', description: 'Equipment ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the equipment.',
    type: EquipmentSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Equipment not found.',
  })
  findOne(@Param('id') id: string): Promise<EquipmentSchemaClass> {
    return this.equipmentService.findOne(id);
  }

  @Get('code/:equipmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get equipment by equipment ID (EQP-XXXXXX)' })
  @ApiParam({
    name: 'equipmentId',
    description: 'Equipment ID (EQP-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the equipment.',
    type: EquipmentSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Equipment not found.',
  })
  findByEquipmentId(
    @Param('equipmentId') equipmentId: string,
  ): Promise<EquipmentSchemaClass> {
    return this.equipmentService.findByEquipmentId(equipmentId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The equipment has been successfully updated.',
    type: EquipmentSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Equipment not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
    @Request() req,
  ): Promise<EquipmentSchemaClass> {
    return this.equipmentService.update(
      id,
      updateEquipmentDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an equipment' })
  @ApiParam({ name: 'id', description: 'Equipment ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The equipment has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Equipment not found.',
  })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.equipmentService.remove(id, req.user.id, req.user.role.id);
  }
}
