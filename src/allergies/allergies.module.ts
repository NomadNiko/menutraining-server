import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllergiesService } from './allergies.service';
import { AllergiesController } from './allergies.controller';
import { AllergySchema, AllergySchemaClass } from './allergy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AllergySchemaClass.name, schema: AllergySchema },
    ]),
  ],
  controllers: [AllergiesController],
  providers: [AllergiesService],
  exports: [AllergiesService],
})
export class AllergiesModule {}
