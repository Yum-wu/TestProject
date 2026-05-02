/**
 * 收货地址 API 服务
 * 封装地址增删改查接口
 */
import { api } from './api';
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from '../types/address';

/**
 * 新增收货地址
 * @param input - 地址信息
 * @returns 创建的地址
 */
export async function createAddress(
  input: CreateAddressInput
): Promise<Address> {
  return api.post<Address>('/addresses', input);
}

/**
 * 获取当前用户所有收货地址
 * @returns 地址列表
 */
export async function getAddresses(): Promise<Address[]> {
  return api.get<Address[]>('/addresses');
}

/**
 * 更新地址（部分字段更新）
 * @param id - 地址 ID
 * @param input - 要更新的字段
 */
export async function updateAddress(
  id: number,
  input: UpdateAddressInput
): Promise<void> {
  await api.put(`/addresses/${id}`, input);
}

/**
 * 删除地址
 * @param id - 地址 ID
 */
export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/addresses/${id}`);
}
