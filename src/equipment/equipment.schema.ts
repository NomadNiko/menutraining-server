// ./menutraining-server/src/equipment/equipment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type EquipmentDocument = HydratedDocument<EquipmentSchemaClass>;

@Schema({
  collection: 'equipment',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class EquipmentSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  equipmentId: string;

  @Prop({ required: true })
  equipmentName: string;

  @Prop()
  equipmentImageUrl: string;
}

export const EquipmentSchema =
  SchemaFactory.createForClass(EquipmentSchemaClass);
