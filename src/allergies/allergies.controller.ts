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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AllergiesService } from './allergies.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { QueryAllergyDto } from './dto/query-allergy.dto';
import { AllergySchemaClass } from './allergy.schema';

@ApiTags('Allergies')
@Controller({
  path: 'allergies',
  version: '1',
})
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new allergy' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The allergy has been successfully created.',
    type: AllergySchemaClass,
  })
  create(
    @Body() createAllergyDto: CreateAllergyDto,
  ): Promise<AllergySchemaClass> {
    return this.allergiesService.create(createAllergyDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all allergies with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all allergies.',
    type: [AllergySchemaClass],
  })
  findAll(@Query() query: QueryAllergyDto): Promise<AllergySchemaClass[]> {
    return this.allergiesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get allergy by ID' })
  @ApiParam({ name: 'id', description: 'Allergy ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the allergy.',
    type: AllergySchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allergy not found.',
  })
  findOne(@Param('id') id: string): Promise<AllergySchemaClass> {
    return this.allergiesService.findOne(id);
  }

  @Get('code/:allergyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get allergy by allergy ID (ALG-XXXXXX)' })
  @ApiParam({
    name: 'allergyId',
    description: 'Allergy ID (ALG-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the allergy.',
    type: AllergySchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allergy not found.',
  })
  findByAllergyId(
    @Param('allergyId') allergyId: string,
  ): Promise<AllergySchemaClass> {
    return this.allergiesService.findByAllergyId(allergyId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an allergy' })
  @ApiParam({ name: 'id', description: 'Allergy ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The allergy has been successfully updated.',
    type: AllergySchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allergy not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateAllergyDto: UpdateAllergyDto,
  ): Promise<AllergySchemaClass> {
    return this.allergiesService.update(id, updateAllergyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an allergy' })
  @ApiParam({ name: 'id', description: 'Allergy ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The allergy has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Allergy not found.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.allergiesService.remove(id);
  }
}
