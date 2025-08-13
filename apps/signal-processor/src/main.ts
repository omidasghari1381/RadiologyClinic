import { NestFactory } from '@nestjs/core';
import { SignalProcessorModule } from './signal-processor.module';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(SignalProcessorModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('SIGNAL_PROCESSOR'));
  await app.startAllMicroservices();
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
}
bootstrap();
