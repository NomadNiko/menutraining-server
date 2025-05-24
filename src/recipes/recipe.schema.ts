// ./src/recipes/recipe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from '../utils/document-entity-helper';

export type RecipeDocument = HydratedDocument<RecipeSchemaClass>;

export class StepIngredientItem {
  @Prop({ required: true })
  ingredientId: string;

  @Prop()
  ingredientMeasure: string;

  @Prop({ required: true })
  ingredientUnits: number;
}

export class RecipeStepItem {
  @Prop({ required: true })
  stepText: string;

  @Prop({ type: [String], default: [] })
  stepEquipment: string[];

  @Prop({ type: [StepIngredientItem], default: [] })
  stepIngredientItems: StepIngredientItem[];

  @Prop()
  stepImageUrl: string;

  @Prop({ required: true, default: 0 })
  order: number;
}

@Schema({
  collection: 'recipes',
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
  },
})
export class RecipeSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true, unique: true })
  recipeId: string;

  @Prop({ required: true })
  recipeName: string;

  @Prop()
  recipeDescription: string;

  @Prop()
  recipeImageUrl: string;

  @Prop({ required: true })
  recipeServings: number;

  @Prop({ required: true })
  recipePrepTime: number;

  @Prop({ required: true })
  recipeTotalTime: number;

  @Prop({ type: [RecipeStepItem], default: [] })
  recipeSteps: RecipeStepItem[];

  @Prop({ required: true })
  restaurantId: string;
}

export const RecipeSchema = SchemaFactory.createForClass(RecipeSchemaClass);
RecipeSchema.index({ restaurantId: 1 });
