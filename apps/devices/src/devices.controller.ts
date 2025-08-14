import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { NormalizeXRayBodyPipe } from './pipes/normalizeXRayBody.pipe';
import { randomUUID } from 'crypto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { transformQueryToNumbers } from './utility/transformToNumber.utils';

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly rmqService: RmqService,
  ) {}

  @Post('create-signal')
  @HttpCode(HttpStatus.ACCEPTED)
  async createSignal(@Body(NormalizeXRayBodyPipe) request: any) {
    const requestId = randomUUID();
    await this.devicesService.enqueueSignal({
      ...request,
      requestId,
    });
    return { status: 'queued', requestId };
  }

  @Post()
  async createDevice(@Body('localIP') localIP: string) {
    return this.devicesService.createDevice(localIP);
  }

  @Get()
  async getDevices(@Query('ip') ip?: string) {
    return this.devicesService.getDevices(ip);
  }

  @Get('signals')
  async getSignals(
    @Query() query: any,
    // @Query('_id') _id?: string,
    // @Query('deviceId') deviceId?: string,
    // @Query('time') time?: string,
    // @Query('dtime') dtime?: string,
    // @Query('x', new ParseIntPipe({ optional: true })) x?: number,
    // @Query('y', new ParseIntPipe({ optional: true })) y?: number,
    // @Query('speed', new ParseIntPipe({ optional: true })) speed?: number,
    // @Query('dataLength', new ParseIntPipe({ optional: true }))
    // dataLength?: number,
    // @Query('dataVolume', new ParseIntPipe({ optional: true }))
    // dataVolume?: number,
  ) {
    const numberFields = [
      'dtime',
      'dtimeMin',
      'dtimeMax',
      'x',
      'xMin',
      'xMax',
      'y',
      'yMin',
      'yMax',
      'speed',
      'speedMin',
      'speedMax',
      'dataLength',
      'dataLengthMin',
      'dataLengthMax',
      'dataVolume',
      'dataVolumeMin',
      'dataVolumeMax',
    ];
    const transformed = transformQueryToNumbers(query, numberFields);
    return this.devicesService.getSignals(transformed);
  }

  @EventPattern('signals')
  async handleSignals(
    @Payload()
    payload: {
      deviceId: string;
      time: number | string;
      data: [number, [number, number, number]][];
      requestId?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    try {
      console.log('mamad');
      this.devicesService.createSignal({
        deviceId: payload.deviceId,
        time: payload.time,
        data: payload.data,
      } as any);
      this.rmqService.ack(context);
    } catch (err) {
      console.log(err);
      this.rmqService.ack(context);
    }
  }
  @Delete()
  async deleteAll(@Body() filter?: object) {
    return this.devicesService.deleteAll(filter);
  }
}
