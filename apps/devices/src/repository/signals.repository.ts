import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Signal } from '../schemas/signal.schema';

@Injectable()
export class SignalsRepository extends AbstractRepository<Signal> {
  protected readonly logger = new Logger(SignalsRepository.name);
  constructor(
    @InjectModel(Signal.name, 'main') signalModel: Model<Signal>,
    @InjectConnection('main') connection: Connection,
  ) {
    super(signalModel, connection);
  }
}
