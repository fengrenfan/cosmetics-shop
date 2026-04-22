import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  /**
   * 获取地址列表
   */
  async getList(userId: number) {
    return this.addressRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  /**
   * 根据ID获取地址
   */
  async getById(id: number, userId: number) {
    return this.addressRepository.findOne({ where: { id, user_id: userId } });
  }

  /**
   * 新增地址
   */
  async create(dto: any) {
    // 如果设为默认，先取消其他默认
    if (dto.is_default) {
      await this.clearDefault(dto.user_id);
    }

    const address = this.addressRepository.create({
      ...dto,
      is_default: dto.is_default ? 1 : 0,
    });

    const result = await this.addressRepository.save(address);
    return result;
  }

  /**
   * 更新地址
   */
  async update(id: number, dto: any, userId: number) {
    const address = await this.addressRepository.findOne({ where: { id, user_id: userId } });
    if (!address) {
      throw new NotFoundException('地址不存在');
    }

    if (dto.is_default) {
      await this.clearDefault(userId);
    }

    Object.assign(address, {
      ...dto,
      is_default: dto.is_default ? 1 : 0,
    });

    await this.addressRepository.save(address);
    return { success: true };
  }

  /**
   * 删除地址
   */
  async remove(id: number, userId: number) {
    await this.addressRepository.delete({ id, user_id: userId });
    return { success: true };
  }

  /**
   * 设为默认地址
   */
  async setDefault(id: number, userId: number) {
    await this.clearDefault(userId);

    await this.addressRepository.update(id, { is_default: 1 });
    return { success: true };
  }

  /**
   * 取消所有默认地址
   */
  private async clearDefault(userId: number) {
    await this.addressRepository.update({ user_id: userId, is_default: 1 }, { is_default: 0 });
  }
}
