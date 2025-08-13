import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NormalizeXRayBodyPipe implements PipeTransform {
  transform(body: any) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Invalid body');
    }
    const deviceId = Object.keys(body)[0];
    if (!deviceId) {
      throw new BadRequestException('Root object must contain <deviceId> key');
    }
    const payload = body[deviceId];
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Invalid payload for given deviceId');
    }
    const { time, data } = payload;
    return { deviceId, time, data }; 
  }
}