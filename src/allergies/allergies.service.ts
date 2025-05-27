import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AllergySchemaClass } from './allergy.schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { QueryAllergyDto } from './dto/query-allergy.dto';

@Injectable()
export class AllergiesService {
  constructor(
    @InjectModel(AllergySchemaClass.name)
    private allergyModel: Model<AllergySchemaClass>,
  ) {}

  async create(createAllergyDto: CreateAllergyDto) {
    const allergyId = await this.generateAllergyId();
    const createdAllergy = new this.allergyModel({
      ...createAllergyDto,
      allergyId,
    });
    const savedAllergy = await createdAllergy.save();
    return savedAllergy.toJSON();
  }

  async findAll(queryDto: QueryAllergyDto) {
    const { page = 1, limit = 10, name } = queryDto;
    const filter: any = {};
    if (name) {
      filter.allergyName = { $regex: name, $options: 'i' };
    }
    const allergies = await this.allergyModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return allergies.map((allergy) => allergy.toJSON());
  }

  async findOne(id: string) {
    const allergy = await this.allergyModel.findById(id).exec();
    if (!allergy) {
      throw new NotFoundException(`Allergy with ID "${id}" not found`);
    }
    return allergy.toJSON();
  }

  async findByAllergyId(allergyId: string) {
    const allergy = await this.allergyModel.findOne({ allergyId }).exec();
    if (!allergy) {
      throw new NotFoundException(`Allergy with ID "${allergyId}" not found`);
    }
    return allergy.toJSON();
  }

  async update(id: string, updateAllergyDto: UpdateAllergyDto) {
    const updatedAllergy = await this.allergyModel
      .findByIdAndUpdate(id, updateAllergyDto, { new: true })
      .exec();
    if (!updatedAllergy) {
      throw new NotFoundException(`Allergy with ID "${id}" not found`);
    }
    return updatedAllergy.toJSON();
  }

  async updateByAllergyId(allergyId: string, updateAllergyDto: UpdateAllergyDto) {
    const updatedAllergy = await this.allergyModel
      .findOneAndUpdate({ allergyId }, updateAllergyDto, { new: true })
      .exec();
    if (!updatedAllergy) {
      throw new NotFoundException(`Allergy with ID "${allergyId}" not found`);
    }
    return updatedAllergy.toJSON();
  }

  async remove(id: string) {
    const result = await this.allergyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Allergy with ID "${id}" not found`);
    }
  }

  async removeByAllergyId(allergyId: string) {
    const result = await this.allergyModel.findOneAndDelete({ allergyId }).exec();
    if (!result) {
      throw new NotFoundException(`Allergy with ID "${allergyId}" not found`);
    }
  }

  private async generateAllergyId(): Promise<string> {
    const lastAllergy = await this.allergyModel
      .findOne({}, { allergyId: 1 })
      .sort({ allergyId: -1 })
      .exec();
    if (!lastAllergy) {
      return 'ALG-000001';
    }
    const lastId = lastAllergy.allergyId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;
    return `ALG-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
