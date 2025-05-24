// ./menutraining-server/src/equipment/equipment.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { EquipmentSchema, EquipmentSchemaClass } from './equipment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EquipmentSchemaClass.name, schema: EquipmentSchema },
    ]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
