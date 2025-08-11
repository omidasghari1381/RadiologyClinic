import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { DevicesRepository } from './devices.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, deviceSchema } from './schemas/devices.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
      envFilePath: './apps/devices/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Device.name, schema: deviceSchema }]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, DevicesRepository],
})
export class DevicesModule {}
