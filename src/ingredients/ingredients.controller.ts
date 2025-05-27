// ./menutraining-server/src/ingredients/ingredients.controller.ts
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
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { QueryIngredientDto } from './dto/query-ingredient.dto';
import { IngredientSchemaClass } from './ingredient.schema';

@ApiTags('Ingredients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
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
    @Request() req,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.create(
      createIngredientDto,
      req.user.id,
      req.user.role.id,
    );
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
    @Request() req,
  ): Promise<IngredientSchemaClass[]> {
    return this.ingredientsService.findAll(
      query,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get(':ingredientId')
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
  findOne(
    @Param('ingredientId') ingredientId: string,
    @Request() req,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.findByIngredientId(
      ingredientId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Patch(':ingredientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an ingredient' })
  @ApiParam({
    name: 'ingredientId',
    description: 'Ingredient ID (ING-XXXXXX pattern)',
  })
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
    @Param('ingredientId') ingredientId: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @Request() req,
  ): Promise<IngredientSchemaClass> {
    return this.ingredientsService.updateByIngredientId(
      ingredientId,
      updateIngredientDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':ingredientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an ingredient' })
  @ApiParam({
    name: 'ingredientId',
    description: 'Ingredient ID (ING-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The ingredient has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found.',
  })
  remove(@Param('ingredientId') ingredientId: string, @Request() req): Promise<void> {
    return this.ingredientsService.removeByIngredientId(
      ingredientId,
      req.user.id,
      req.user.role.id,
    );
  }
}
