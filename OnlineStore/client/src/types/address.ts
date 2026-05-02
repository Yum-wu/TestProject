/**
 * 收货地址相关类型定义
 * 涵盖地址实体、创建与更新操作参数
 */

/** 收货地址 */
export interface Address {
  /** 地址 ID */
  id: number;
  /** 所属用户 ID */
  user_id: number;
  /** 收件人姓名 */
  receiver_name: string;
  /** 联系电话 */
  phone: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区/县 */
  district: string;
  /** 详细地址（街道/门牌号） */
  detail: string;
  /** 是否默认地址：1=是，0=否 */
  is_default: number;
  /** 创建时间 */
  created_at: string;
  /** 最近更新时间 */
  updated_at: string;
}

/** 创建地址请求参数 */
export interface CreateAddressInput {
  /** 收件人姓名 */
  receiver_name: string;
  /** 联系电话 */
  phone: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区/县 */
  district: string;
  /** 详细地址 */
  detail: string;
  /** 是否设为默认地址 */
  is_default?: boolean;
}

/** 更新地址请求参数（所有字段可选，按需更新） */
export interface UpdateAddressInput {
  receiver_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  is_default?: boolean;
}
