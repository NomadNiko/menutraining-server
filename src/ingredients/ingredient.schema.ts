import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type IngredientDocument = HydratedDocument<IngredientSchemaClass>;

@Schema({
  collection: 'ingredients',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class IngredientSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  ingredientId: string;

  @Prop({ required: true })
  ingredientName: string;

  @Prop({ type: [String], default: [] })
  ingredientAllergies: string[];

  @Prop()
  ingredientImageUrl: string;

  @Prop({ type: [String], default: [] })
  subIngredients: string[];
}

export const IngredientSchema = SchemaFactory.createForClass(
  IngredientSchemaClass,
);
