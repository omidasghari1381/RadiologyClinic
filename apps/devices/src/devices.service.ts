import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Sample } from './schemas/signal.schema';
import { SignalsRepository } from './repository/signals.repository';
import { Types } from 'mongoose';
import { DevicesRepository } from './repository/devices.repository';
import { SIGNAL_PROCESSOR_SERVICE } from './constans/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateSignalDto } from './dto/createXray.dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly signalRepo: SignalsRepository,
    private readonly deviceRepo: DevicesRepository,
    @Inject(SIGNAL_PROCESSOR_SERVICE)
    private signalProcessorClinet: ClientProxy,
  ) {}
  createSignal = async (request: CreateSignalDto) => {
    const session = await this.signalRepo.startTransaction();
    try {
      await this.deviceRepo.find({ _id: request.deviceId });
      const samples: Sample[] = request.data.map(([t, [x, y, speed]]) => ({
        time: t,
        x,
        y,
        speed,
      }));
      const doc = await this.signalRepo.create(
        {
          deviceId: new Types.ObjectId(request.deviceId),
          time: new Date(request.time),
          data: samples,
          dataLength: samples.length,
          dataVolume: 0,
        },
        { session },
      );
      console.log(doc);
      await lastValueFrom(
        this.signalProcessorClinet.emit('signal_created', {
          doc,
        }),
      );
      await session.commitTransaction();
      return doc;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
  };
  createDevice = async (localIP: string) => {
    const device = await this.deviceRepo.create({ localIP: localIP });
    return device;
  };
  getDevices = async (localIP?: string) => {
    let where = {};
    if (localIP) where = { localIP };
    return this.deviceRepo.find(where);
  };
  getSignals = async (filter?: any) => {
    return this.signalRepo.find({});
  };
}
