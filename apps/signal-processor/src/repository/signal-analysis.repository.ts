import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { SignalAnalysis } from '../schemas/signal-analysis.schema';

@Injectable()
export class SignalAnalysisRepository extends AbstractRepository<SignalAnalysis> {
  protected readonly logger = new Logger(SignalAnalysisRepository.name);
  constructor(
    @InjectModel(SignalAnalysis.name, 'main')
    signalAnalysisModel: Model<SignalAnalysis>,
    @InjectConnection('main') connection: Connection,
  ) {
    super(signalAnalysisModel, connection);
  }
}
