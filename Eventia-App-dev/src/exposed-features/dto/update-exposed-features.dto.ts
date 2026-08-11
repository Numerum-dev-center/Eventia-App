import { PartialType } from '@nestjs/mapped-types';
import { CreateExposedFeaturesDto } from './create-exposed-features.dto';

export class UpdateExposedFeaturesDto extends PartialType(CreateExposedFeaturesDto) {}
