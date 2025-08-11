import { Module } from '@nestjs/common';
import { SignalProcessorController } from './signal-processor.controller';
import { SignalProcessorService } from './signal-processor.service';

@Module({
  imports: [],
  controllers: [SignalProcessorController],
  providers: [SignalProcessorService],
})
export class SignalProcessorModule {}
