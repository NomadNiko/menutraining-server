import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type AllergyDocument = HydratedDocument<AllergySchemaClass>;

@Schema({
  collection: 'allergies',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class AllergySchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  allergyId: string;

  @Prop({ required: true })
  allergyName: string;

  @Prop()
  allergyLogoUrl: string;
}

export const AllergySchema = SchemaFactory.createForClass(AllergySchemaClass);
