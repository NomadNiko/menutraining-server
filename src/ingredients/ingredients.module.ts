import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientSchema, IngredientSchemaClass } from './ingredient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IngredientSchemaClass.name, schema: IngredientSchema },
    ]),
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [IngredientsService],
})
export class IngredientsModule {}
