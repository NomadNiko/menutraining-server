// ./menutraining-server/src/equipment/equipment.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EquipmentSchemaClass } from './equipment.schema';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectModel(EquipmentSchemaClass.name)
    private equipmentModel: Model<EquipmentSchemaClass>,
  ) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    userId: string,
    userRole: string,
  ) {
    // Check if user is an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      throw new ForbiddenException('Only administrators can create equipment');
    }

    const equipmentId = await this.generateEquipmentId();
    const createdEquipment = new this.equipmentModel({
      ...createEquipmentDto,
      equipmentId,
    });
    const savedEquipment = await createdEquipment.save();
    return savedEquipment.toJSON();
  }

  async findAll(queryDto: QueryEquipmentDto) {
    const { page = 1, limit = 10, name } = queryDto;
    const filter: any = {};

    if (name) {
      filter.equipmentName = { $regex: name, $options: 'i' };
    }

    const equipment = await this.equipmentModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return equipment.map((item) => item.toJSON());
  }

  async findOne(id: string) {
    const equipment = await this.equipmentModel.findById(id).exec();

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID "${id}" not found`);
    }

    return equipment.toJSON();
  }

  async findByEquipmentId(equipmentId: string) {
    const equipment = await this.equipmentModel.findOne({ equipmentId }).exec();

    if (!equipment) {
      throw new NotFoundException(
        `Equipment with ID "${equipmentId}" not found`,
      );
    }

    return equipment.toJSON();
  }

  async update(
    id: string,
    updateEquipmentDto: UpdateEquipmentDto,
    userId: string,
    userRole: string,
  ) {
    // Check if user is an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      throw new ForbiddenException('Only administrators can update equipment');
    }

    const updatedEquipment = await this.equipmentModel
      .findByIdAndUpdate(id, updateEquipmentDto, { new: true })
      .exec();

    if (!updatedEquipment) {
      throw new NotFoundException(`Equipment with ID "${id}" not found`);
    }

    return updatedEquipment.toJSON();
  }

  async remove(id: string, userId: string, userRole: string) {
    // Check if user is an admin
    if (userRole !== RoleEnum[RoleEnum.admin].toString()) {
      throw new ForbiddenException('Only administrators can delete equipment');
    }

    const result = await this.equipmentModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Equipment with ID "${id}" not found`);
    }
  }

  private async generateEquipmentId(): Promise<string> {
    const lastEquipment = await this.equipmentModel
      .findOne({}, { equipmentId: 1 })
      .sort({ equipmentId: -1 })
      .exec();

    if (!lastEquipment) {
      return 'EQP-000001';
    }

    const lastId = lastEquipment.equipmentId;
    const numericPart = parseInt(lastId.substring(4), 10);
    const newNumericPart = numericPart + 1;
    return `EQP-${newNumericPart.toString().padStart(6, '0')}`;
  }
}
