import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Device } from '../schemas/devices.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

@Injectable()
export class DevicesRepository extends AbstractRepository<Device> {
  protected readonly logger = new Logger(DevicesRepository.name);
  constructor(
    @InjectModel(Device.name, 'main') deviceModel: Model<Device>,
    @InjectConnection('main') connection: Connection,
  ) {
    super(deviceModel, connection);
  }
}
