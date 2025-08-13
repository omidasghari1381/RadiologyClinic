import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class Sample {
  @Prop({ type: Number, required: true, min: 0 })
  time: number;
  @Prop({ type: Number, required: true })
  x: number;
  @Prop({ type: Number, required: true })
  y: number;
  @Prop({ type: Number, required: true })
  speed: number;
}
export const SampleSchema = SchemaFactory.createForClass(Sample);
@Schema({ versionKey: false })
export class Signal extends AbstractDocument {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Device',
    index: true,
    required: true,
  })
  deviceId: Types.ObjectId;
  @Prop({ type: Date, required: true, index: true })
  time: Date;
  @Prop({ type: [SampleSchema], required: true, default: [] })
  data: Sample[];
  @Prop({ type: Number, required: true })
  dataLength: number;
  @Prop({ type: Number })
  dataVolume: number;
}

export const signalSchema = SchemaFactory.createForClass(Signal);

signalSchema.pre('save', function (next) {
  if (this.data) {
    this.dataLength = this.data.length;
    this.dataVolume = Buffer.byteLength(JSON.stringify(this.data));
  }
  next();
});
