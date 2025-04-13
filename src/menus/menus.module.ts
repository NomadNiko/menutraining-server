// src/menus/menus.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { MenuSchema, MenuSchemaClass } from './menu.schema';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MenuSectionsModule } from '../menu-sections/menu-sections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuSchemaClass.name, schema: MenuSchema },
    ]),
    RestaurantsModule,
    MenuSectionsModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
