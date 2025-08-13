import { Types } from 'mongoose';
type RawPoint = [number, [number, number, number]];
export type Sample = {
  time: number;
  x: number;
  y: number;
  speed: number;
};

export function normalizeXrayPayload(payload: any): {
  _id: Types.ObjectId;
  deviceId: Types.ObjectId | string;
  time: Date;
  data: Sample[];
} {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: not an object');
  }
  const { _id, deviceId, data, time } = payload.doc;
  if (!Array.isArray(data)) {
    throw new Error('Invalid payload: missing data array');
  }
  const normalizedDeviceId =
    typeof deviceId === 'string' && Types.ObjectId.isValid(deviceId)
      ? new Types.ObjectId(deviceId)
      : deviceId;

  const samples: Sample[] = data
    .map((row: RawPoint) => {
      if (
        !Array.isArray(row) ||
        row.length !== 2 ||
        typeof row[0] !== 'number' ||
        !Array.isArray(row[1]) ||
        row[1].length !== 3
      ) {
        return null;
      }

      const offset = row[0];
      const [x, y, speed] = row[1];

      if (
        !Number.isFinite(offset) ||
        offset < 0 ||
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(speed)
      ) {
        return null;
      }

      const sample: Sample = {
        time: offset,
        x,
        y,
        speed,
      };
      return sample;
    })
    .filter((s: Sample | null): s is Sample => !!s)
    .sort((a, b) => a.time - b.time);

  return {
    _id,
    deviceId: normalizedDeviceId,
    time: new Date(time),
    data: samples,
  };
}

export function analyzeMeta(samples: Sample[]) {
  const n = samples.length;
  const dataLength = n;

  const dataVolumeBytes = Buffer.byteLength(JSON.stringify(samples));

  const durationMs = n > 1 ? samples[n - 1].time - samples[0].time : 0;

  let pathLength = 0;
  const speeds: number[] = [];
  let maxSpeed = 0;
  let sumSpeed = 0;

  for (let i = 1; i < n; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    pathLength += Math.hypot(dx, dy);
  }

  for (let i = 0; i < n; i++) {
    const s = samples[i].speed;
    speeds.push(s);
    sumSpeed += s;
    if (s > maxSpeed) maxSpeed = s;
  }

  const meanSpeed = n ? sumSpeed / n : 0;

  const p = (arr: number[], q: number) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((x, y) => x - y);
    const idx = Math.floor(q * (sorted.length - 1));
    return sorted[idx];
  };
  const p95Speed = p(speeds, 0.95);

  return {
    durationMs,
    dataLength,
    dataVolumeBytes,
    pathLength,
    meanSpeed,
    maxSpeed,
    p95Speed,
  };
}
