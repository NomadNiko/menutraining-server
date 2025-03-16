import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type MenuItemDocument = HydratedDocument<MenuItemSchemaClass>;

@Schema({
  collection: 'menu-items',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class MenuItemSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  menuItemId: string;

  @Prop({ required: true })
  menuItemName: string;

  @Prop()
  menuItemDescription: string;

  @Prop({ type: [String], default: [] })
  menuItemIngredients: string[];

  @Prop()
  menuItemUrl: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItemSchemaClass);
