import { Injectable, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { analyzeMeta, normalizeXrayPayload } from './utility/normalize.utils';
import { SignalAnalysisRepository } from './repository/signal-analysis.repository';

@Injectable()
export class SignalProcessorService {
  private readonly logger = new Logger(SignalProcessorService.name);
  constructor(private readonly analysisrepo: SignalAnalysisRepository) {}

  analyzeAndStore = async (payload: any) => {
    const { _id, deviceId, time: baseTs, data } = normalizeXrayPayload(payload);

    const metrics = analyzeMeta(data);

    const doc = await this.analysisrepo.create({
      signalId: new Types.ObjectId(_id),
      deviceId: new Types.ObjectId(deviceId),
      baseTime: new Date(baseTs),
      metrics,
    });

    return doc;
  };
  getAnalysis = async () => {
    const list = await this.analysisrepo.find({});
    return list;
  };
  deleteAll = async () => {
    return this.analysisrepo.deleteAll();
  };
}
