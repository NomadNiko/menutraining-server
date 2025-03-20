import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type RestaurantDocument = HydratedDocument<RestaurantSchemaClass>;

@Schema({
  collection: 'restaurants',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class RestaurantSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  restaurantId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  website: string;

  @Prop({ required: true })
  createdBy: string; // User ID of creator

  @Prop({ type: [String], default: [] })
  associatedUsers: string[]; // Array of user IDs
}

export const RestaurantSchema = SchemaFactory.createForClass(
  RestaurantSchemaClass,
);
