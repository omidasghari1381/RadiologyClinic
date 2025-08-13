import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Device extends AbstractDocument {
  @Prop({
    type: String,
    required: true,
  })
  localIP: string;
}
export const deviceSchema = SchemaFactory.createForClass(Device);
