// ./src/recipes/recipes.controller.ts
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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { RecipeSchemaClass } from './recipe.schema';

@ApiTags('Recipes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'recipes',
  version: '1',
})
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The recipe has been successfully created.',
    type: RecipeSchemaClass,
  })
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @Request() req,
  ): Promise<RecipeSchemaClass> {
    return this.recipesService.create(
      createRecipeDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipes with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all recipes.',
    type: [RecipeSchemaClass],
  })
  findAll(
    @Query() query: QueryRecipeDto,
    @Request() req,
  ): Promise<RecipeSchemaClass[]> {
    return this.recipesService.findAll(query, req.user.id, req.user.role.id);
  }

  @Get(':recipeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recipe by recipe ID (REC-XXXXXX)' })
  @ApiParam({
    name: 'recipeId',
    description: 'Recipe ID (REC-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the recipe.',
    type: RecipeSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found.',
  })
  findOne(@Param('recipeId') recipeId: string, @Request() req): Promise<RecipeSchemaClass> {
    return this.recipesService.findByRecipeId(
      recipeId,
      req.user.id,
      req.user.role.id,
    );
  }

  @Patch(':recipeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({
    name: 'recipeId',
    description: 'Recipe ID (REC-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The recipe has been successfully updated.',
    type: RecipeSchemaClass,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found.',
  })
  update(
    @Param('recipeId') recipeId: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Request() req,
  ): Promise<RecipeSchemaClass> {
    return this.recipesService.updateByRecipeId(
      recipeId,
      updateRecipeDto,
      req.user.id,
      req.user.role.id,
    );
  }

  @Delete(':recipeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({
    name: 'recipeId',
    description: 'Recipe ID (REC-XXXXXX pattern)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The recipe has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found.',
  })
  remove(@Param('recipeId') recipeId: string, @Request() req): Promise<void> {
    return this.recipesService.removeByRecipeId(
      recipeId,
      req.user.id,
      req.user.role.id,
    );
  }
}
