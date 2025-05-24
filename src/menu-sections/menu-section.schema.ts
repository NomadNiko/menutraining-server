// src/menu-sections/menu-section.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type MenuSectionDocument = HydratedDocument<MenuSectionSchemaClass>;

export class SectionItem {
  @Prop({ required: true })
  menuItemId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl: string;

  @Prop({ required: true, default: 0 })
  order: number;
}

@Schema({
  collection: 'menu-sections',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class MenuSectionSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  menuSectionId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;

  @Prop({ type: [SectionItem], default: [] })
  items: SectionItem[];

  @Prop({ required: true })
  restaurantId: string;
}

export const MenuSectionSchema = SchemaFactory.createForClass(
  MenuSectionSchemaClass,
);
MenuSectionSchema.index({ restaurantId: 1 });
