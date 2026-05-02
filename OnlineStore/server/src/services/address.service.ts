/**
 * 收货地址业务逻辑服务
 *
 * 负责地址的增删改查，以及默认地址管理逻辑。
 *
 * 默认地址规则：
 * 1. 新增/编辑地址设 is_default=true → 先清除用户其他默认标记，再写入
 * 2. 删除默认地址 → 自动将剩余第一个地址设为默认
 * 3. 取消默认不自动设置其他为默认
 */

import * as addressModel from '../models/address.model';
import { Address, CreateAddressInput, UpdateAddressInput } from '../types/address';
import { BusinessError } from '../utils/errors';

/**
 * 新增地址
 */
export async function createAddress(userId: number, data: CreateAddressInput): Promise<Address> {
  // 若设为默认，先取消其他默认地址
  if (data.is_default) {
    await addressModel.clearDefault(userId);
  }

  const insertId = await addressModel.create({ ...data, user_id: userId });

  // 查回完整记录
  const address = await addressModel.findById(insertId);
  return address!;
}

/**
 * 查询用户所有地址
 */
export async function getAddresses(userId: number): Promise<Address[]> {
  return await addressModel.findByUserId(userId);
}

/**
 * 更新地址
 */
export async function updateAddress(
  userId: number,
  addressId: number,
  data: UpdateAddressInput
): Promise<Address> {
  // 校验存在
  const address = await addressModel.findById(addressId);
  if (!address) {
    throw new BusinessError(2301, '地址不存在');
  }

  // 权限校验
  if (address.user_id !== userId) {
    throw new BusinessError(2301, '地址不存在');
  }

  // 若设为默认，先取消其他默认
  if (data.is_default === true) {
    await addressModel.clearDefault(userId);
  }

  await addressModel.update(addressId, data);

  // 查回更新后记录
  const updated = await addressModel.findById(addressId);
  return updated!;
}

/**
 * 删除地址
 *
 * 若删除的是默认地址，将剩余第一个地址设为默认。
 */
export async function deleteAddress(userId: number, addressId: number): Promise<void> {
  // 校验存在
  const address = await addressModel.findById(addressId);
  if (!address) {
    throw new BusinessError(2301, '地址不存在');
  }

  // 权限校验
  if (address.user_id !== userId) {
    throw new BusinessError(2301, '地址不存在');
  }

  const wasDefault = address.is_default === 1;

  await addressModel.deleteById(addressId);

  // 若删除的是默认地址，将剩余第一个设为默认
  if (wasDefault) {
    const firstAddress = await addressModel.findFirstByUserId(userId);
    if (firstAddress) {
      await addressModel.setDefault(firstAddress.id);
    }
  }
}
