import { Module } from '@nestjs/common';
import { SignalProcessorController } from './signal-processor.controller';
import { SignalProcessorService } from './signal-processor.service';
import { DatabaseModule, RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SignalAnalysis,
  SignalAnalysisSchema,
} from './schemas/signal-analysis.schema';
import { SignalAnalysisRepository } from './repository/signal-analysis.repository';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/signal-processor/.env'),
        join(process.cwd(), '.env'),
        join(__dirname, '..', '.env'),
      ],
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_SIGNAL_PROCESSOR_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MongooseModule.forFeature(
      [{ name: SignalAnalysis.name, schema: SignalAnalysisSchema }],
      'main',
    ),
    RmqModule,
  ],
  controllers: [SignalProcessorController],
  providers: [SignalProcessorService, SignalAnalysisRepository],
})
export class SignalProcessorModule {}
