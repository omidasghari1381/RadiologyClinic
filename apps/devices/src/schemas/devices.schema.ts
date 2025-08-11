import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Device extends AbstractDocument {
  @Prop()
  localIP: number;
}
export const deviceSchema = SchemaFactory.createForClass(Device);
