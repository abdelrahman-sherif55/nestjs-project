import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Examples {
  @Prop()
  name: string;

  @Prop()
  cover: string;

  @Prop([String])
  images: string[];
}

export type ExampleDocument = HydratedDocument<Examples>;
export const ExamplesSchema = SchemaFactory.createForClass(Examples);
