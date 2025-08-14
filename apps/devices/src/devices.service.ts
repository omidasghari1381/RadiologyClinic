import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Sample } from './schemas/signal.schema';
import { SignalsRepository } from './repository/signals.repository';
import { Types } from 'mongoose';
import { DevicesRepository } from './repository/devices.repository';
import {
  SIGNAL_CREATOR_SERVICE,
  SIGNAL_PROCESSOR_SERVICE,
} from './constans/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateSignalDto } from './dto/createXray.dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly signalRepo: SignalsRepository,
    private readonly deviceRepo: DevicesRepository,
    @Inject(SIGNAL_PROCESSOR_SERVICE)
    private signalProcessorClient: ClientProxy,
    @Inject(SIGNAL_CREATOR_SERVICE)
    private signalCreatorClient: ClientProxy,
  ) {}

  async enqueueSignal(payload: {
    deviceId: string;
    time: number | string;
    data: [number, [number, number, number]][];
    requestId?: string;
  }) {
    if (!payload?.deviceId || !payload?.data) {
      throw new BadRequestException('deviceId and data are required');
    }
    await lastValueFrom(this.signalCreatorClient.emit('signals', payload));
  }

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
      await session.commitTransaction();
      await lastValueFrom(
        this.signalProcessorClient.emit('signal_created', {
          doc,
        }),
      );
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

  getSignals = async (
    query: any,
    // _id?: string,
    // deviceId?: string,
    // timeFrom?: string,
    // timeTo?: string,
    // dtime?: number,
    // dtimeMin?: number,
    // dtimeMax?: number,
    // x?: number,
    // xMin?: number,
    // xMax?: number,
    // y?: number,
    // yMin?: number,
    // yMax?: number,
    // speed?: number,
    // speedMin?: number,
    // speedMax?: number,
    // dataLength?: number,
    // dataLengthMin?: number,
    // dataLengthMax?: number,
    // dataVolume?: number,
    // dataVolumeMin?: number,
    // dataVolumeMax?: number,
  ) => {
    const {
      _id,
      deviceId,
      timeFrom,
      timeTo,
      dtime,
      dtimeMin,
      dtimeMax,
      x,
      xMin,
      xMax,
      y,
      yMin,
      yMax,
      speed,
      speedMin,
      speedMax,
      dataLength,
      dataLengthMin,
      dataLengthMax,
      dataVolume,
      dataVolumeMin,
      dataVolumeMax,
    } = query;
    const where: Record<string, any> = {};
    if (_id) where._id = new Types.ObjectId(_id);
    if (deviceId) where.deviceId = new Types.ObjectId(deviceId);
    const timeRange: Record<string, any> = {};
    if (timeFrom) {
      const fromNum = Number(timeFrom);
      const from = Number.isFinite(fromNum)
        ? new Date(fromNum)
        : new Date(timeFrom);
      if (!isNaN(from.getTime())) timeRange.$gte = from;
    }
    if (timeTo) {
      const toNum = Number(timeTo);
      const to = Number.isFinite(toNum) ? new Date(toNum) : new Date(timeTo);
      if (!isNaN(to.getTime())) timeRange.$lte = to;
    }
    if (Object.keys(timeRange).length > 0) where.time = timeRange;
    const range = (val?: number, min?: number, max?: number) => {
      if (val !== undefined) return val;
      const r: Record<string, any> = {};
      if (min !== undefined) r.$gte = min;
      if (max !== undefined) r.$lte = max;
      return Object.keys(r).length ? r : undefined;
    };
    const elem: Record<string, any> = {};
    const dtimeRange = range(dtime, dtimeMin, dtimeMax);
    if (dtimeRange !== undefined) elem.time = dtimeRange;
    const xRange = range(x, xMin, xMax);
    if (xRange !== undefined) elem.x = xRange;
    const yRange = range(y, yMin, yMax);
    if (yRange !== undefined) elem.y = yRange;
    const speedRange = range(speed, speedMin, speedMax);
    if (speedRange !== undefined) elem.speed = speedRange;
    if (Object.keys(elem).length > 0) where.data = { $elemMatch: elem };
    const dataLengthRange = range(dataLength, dataLengthMin, dataLengthMax);
    if (dataLengthRange !== undefined) where.dataLength = dataLengthRange;
    const dataVolumeRange = range(dataVolume, dataVolumeMin, dataVolumeMax);
    if (dataVolumeRange !== undefined) where.dataVolume = dataVolumeRange;
    return this.signalRepo.find(where);
  };

  deleteAll = async (filter?: object) => {
    let where = {};
    if (filter) where = filter;
    return this.signalRepo.deleteAll(where);
  };
}
