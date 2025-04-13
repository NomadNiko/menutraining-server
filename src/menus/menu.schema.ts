// src/menus/menu.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type MenuDocument = HydratedDocument<MenuSchemaClass>;

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Schema({
  collection: 'menus',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class MenuSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  menuId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [String], enum: Object.values(DayOfWeek), default: [] })
  activeDays: DayOfWeek[];

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;

  @Prop({ type: [String], default: [] })
  menuSections: string[];

  @Prop({ required: true })
  restaurantId: string;
}

export const MenuSchema = SchemaFactory.createForClass(MenuSchemaClass);
MenuSchema.index({ restaurantId: 1 });
