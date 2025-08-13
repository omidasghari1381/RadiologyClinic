import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
})
export class SignalAnalysis extends AbstractDocument {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Signal',
    index: true,
    required: true,
  })
  signalId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Device',
    index: true,
    required: true,
  })
  deviceId: Types.ObjectId;

  @Prop({ type: Date, index: true, required: true })
  baseTime: Date;

  @Prop({
    type: {
      durationMs: Number,
      dataLength: Number,
      dataVolumeBytes: Number,
      pathLength: Number,
      meanSpeed: Number,
      maxSpeed: Number,
      p95Speed: Number,
    },
    required: true,
  })
  metrics: {
    durationMs: number;
    dataLength: number;
    dataVolumeBytes: number;
    pathLength: number;
    meanSpeed: number;
    maxSpeed: number;
    p95Speed: number;
  };
}

export type SignalAnalysisDocument = HydratedDocument<SignalAnalysis>;
export const SignalAnalysisSchema =
  SchemaFactory.createForClass(SignalAnalysis);
