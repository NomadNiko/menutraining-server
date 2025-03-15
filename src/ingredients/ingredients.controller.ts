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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { IngredientSchemaClass } from './ingredient.schema';

@ApiTags('Ingredients')
@Controller({
  path: 'ingredients',
  version: '1',
})
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The ingredient has been successfully created.',
    type: IngredientSchemaClass,
  })
  create(
    @Body() createIngredientDto: CreateIngredientDto,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all ingredients with filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all ingredients.',
    type: [IngredientSchemaClass],
  })
  findAll(
    @Query() query: QueryIngredientDto,
  ): Promise<IngredientSchemaClass[]> {
    return this.ingredientsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get ingredient by ID' })
  @ApiParam({ name: 'id', description: 'Ingredient ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the ingredient.',
    type: IngredientSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found.',
  })
  findOne(@Param('id') id: string): Promise<IngredientSchemaClass> {
    return this.ingredientsService.findOne(id);
  }

  @Get('code/:ingredientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get ingredient by ingredient ID (ING-XXXXXX)' })
  @ApiParam({
    name: 'ingredientId',
    description: 'Ingredient ID (ING-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the ingredient.',
    type: IngredientSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found.',
  })
  findByIngredientId(
    @Param('ingredientId') ingredientId: string,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.findByIngredientId(ingredientId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiParam({ name: 'id', description: 'Ingredient ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The ingredient has been successfully updated.',
    type: IngredientSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found.',
  })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiParam({ name: 'id', description: 'Ingredient ID (MongoDB ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The ingredient has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
