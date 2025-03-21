// ./menutraining-server/src/menu-items/menu-items.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemSchema, MenuItemSchemaClass } from './menu-item.schema';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import {
  IngredientSchema,
  IngredientSchemaClass,
} from '../ingredients/ingredient.schema';
import { AllergySchema, AllergySchemaClass } from '../allergies/allergy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItemSchemaClass.name, schema: MenuItemSchema },
      { name: IngredientSchemaClass.name, schema: IngredientSchema },
      { name: AllergySchemaClass.name, schema: AllergySchema },
    ]),
    RestaurantsModule,
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
