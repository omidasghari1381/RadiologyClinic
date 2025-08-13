import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { NormalizeXRayBodyPipe } from './pipes/normalizeXRayBody.pipe';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}
  @Post('create-signal')
  async createSignal(@Body(NormalizeXRayBodyPipe) requset: any) {
    return this.devicesService.createSignal(requset);
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
  async getSignals() {
    return this.devicesService.getSignals();
  }
}
