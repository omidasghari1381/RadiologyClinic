import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'sampleTuple', async: false })
class SampleTupleConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!Array.isArray(value) || value.length !== 2) return false;
    const [t, inner] = value;
    if (typeof t !== 'number' || !Number.isFinite(t) || t < 0) return false;
    if (!Array.isArray(inner) || inner.length !== 3) return false;
    const [x, y, speed] = inner;
    return [x, y, speed].every(
      (v) => typeof v === 'number' && Number.isFinite(v),
    );
  }
  defaultMessage() {
    return 'each data must be like this [number,[number,number,number]]';
  }
}

export class CreateSignalDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;

  @IsNumber()
  @Min(0)
  time!: number; 

  @IsArray()
  @ArrayMinSize(1)
  @Validate(SampleTupleConstraint, { each: true })
  data!: Array<[number, [number, number, number]]>;
}
