import { Controller, Delete, Get } from '@nestjs/common';
import { SignalProcessorService } from './signal-processor.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller('signal-processor')
export class SignalProcessorController {
  constructor(
    private readonly signalProcessorService: SignalProcessorService,
    private readonly rmqService: RmqService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }
  @EventPattern('signal_created')
  async handleSignalCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    try {
      this.signalProcessorService.analyzeAndStore(data);
      this.rmqService.ack(context);
    } catch (err) {
      console.error(err);
      this.rmqService.ack(context);
    }
  }
  @Get()
  getAnalysis() {
    return this.signalProcessorService.getAnalysis();
  }
  @Delete()
  deleteAll() {
    return this.signalProcessorService.deleteAll();
  }
}
