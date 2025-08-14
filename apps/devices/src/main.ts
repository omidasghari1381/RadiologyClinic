import { NestFactory } from '@nestjs/core';
import { DevicesModule } from './devices.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(DevicesModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const configService = app.get(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('SIGNAL_CREATOR'));
  await app.startAllMicroservices();
  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}
bootstrap();
