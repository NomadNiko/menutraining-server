// ./menutraining-server/src/ingredients/ingredients.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientSchema, IngredientSchemaClass } from './ingredient.schema';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IngredientSchemaClass.name, schema: IngredientSchema },
    ]),
    RestaurantsModule,
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
