/**
 * 收货地址相关类型定义
 */

/** 收货地址实体 */
export interface Address {
  id: number;
  user_id: number;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default: number;   // MySQL 中 TINYINT(1) 返回 number
  created_at: string;
  updated_at: string;
}

/** 新增地址的输入参数 */
export interface CreateAddressInput {
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  is_default?: boolean;
}

/** 更新地址的输入参数（所有字段可选） */
export interface UpdateAddressInput {
  receiver_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  is_default?: boolean;
}
