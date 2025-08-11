import { Injectable } from '@nestjs/common';

@Injectable()
export class SignalProcessorService {
  getHello(): string {
    return 'Hello World!';
  }
}
