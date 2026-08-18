import { Injectable } from '@nestjs/common';
import { CreateExposedFeaturesDto } from './dto/create-exposed-features.dto';
import { UpdateExposedFeaturesDto } from './dto/update-exposed-features.dto';

@Injectable()
export class ExposedFeaturesService {
  create(createExposedFeaturesDto: CreateExposedFeaturesDto) {
    return 'This action adds a new ExposedFeatures';
  }

  findAll() {
    return `This action returns all ExposedFeaturess`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ExposedFeatures`;
  }

  update(id: number, updateExposedFeaturesDto: UpdateExposedFeaturesDto) {
    return `This action updates a #${id} ExposedFeatures`;
  }

  remove(id: number) {
    return `This action removes a #${id} ExposedFeatures`;
  }
}
