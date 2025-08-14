import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule, RmqModule } from '@app/common';
import { DevicesRepository } from './repository/devices.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, deviceSchema } from './schemas/devices.schema';
import { SignalsRepository } from './repository/signals.repository';
import { Signal, signalSchema } from './schemas/signal.schema';
import {
  SIGNAL_CREATOR_SERVICE,
  SIGNAL_PROCESSOR_SERVICE,
} from './constans/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBIT_MQ_DEVICES_SERVICE_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/devices/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature(
      [
        { name: Device.name, schema: deviceSchema },
        { name: Signal.name, schema: signalSchema },
      ],
      'main',
    ),
    RmqModule.register({ name: SIGNAL_PROCESSOR_SERVICE }),
    RmqModule.register({ name: SIGNAL_CREATOR_SERVICE }),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, DevicesRepository, SignalsRepository],
})
export class DevicesModule {}
