import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { RecipeSchema, RecipeSchemaClass } from './recipe.schema';
import {
  IngredientSchema,
  IngredientSchemaClass,
} from '../ingredients/ingredient.schema';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecipeSchemaClass.name, schema: RecipeSchema },
      { name: IngredientSchemaClass.name, schema: IngredientSchema },
    ]),
    RestaurantsModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
