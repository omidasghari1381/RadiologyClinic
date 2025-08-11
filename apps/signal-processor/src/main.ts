import { NestFactory } from '@nestjs/core';
import { SignalProcessorModule } from './signal-processor.module';

async function bootstrap() {
  const app = await NestFactory.create(SignalProcessorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
