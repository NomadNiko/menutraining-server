// src/menu-sections/menu-sections.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuSectionsService } from './menu-sections.service';
import { MenuSectionsController } from './menu-sections.controller';
import {
  MenuSectionSchema,
  MenuSectionSchemaClass,
} from './menu-section.schema';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuSectionSchemaClass.name, schema: MenuSectionSchema },
    ]),
    RestaurantsModule,
  ],
  controllers: [MenuSectionsController],
  providers: [MenuSectionsService],
  exports: [MenuSectionsService],
})
export class MenuSectionsModule {}
