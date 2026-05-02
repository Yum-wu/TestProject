/**
 * 前端校验工具函数
 * 提供手机号、数量等常见表单字段的校验逻辑
 */

/**
 * 校验中国大陆手机号格式
 *
 * 规则：
 * - 11 位数字
 * - 以 1 开头
 * - 第 2 位为 3-9（覆盖各运营商号段：13x, 14x, 15x, 16x, 17x, 18x, 19x）
 *
 * @param phone - 待校验的手机号字符串
 * @returns 是否合法
 *
 * @example
 * validatePhone('13812345678')  // true
 * validatePhone('12345678901')  // false (第 2 位不在 3-9 范围)
 * validatePhone('1381234567')   // false (不足 11 位)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;

  // 去掉空格和横线再校验
  const cleaned = phone.replace(/[\s-]/g, '');
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(cleaned);
}

/**
 * 校验购买数量是否为正整数
 *
 * @param qty - 购买数量
 * @param maxQty - 最大允许数量（可选，默认不限制）
 * @returns 校验结果对象 { valid: boolean, message: string }
 *
 * @example
 * validateQuantity(5)           // { valid: true, message: '' }
 * validateQuantity(0)           // { valid: false, message: '数量必须大于 0' }
 * validateQuantity(5.5)         // { valid: false, message: '数量必须为正整数' }
 */
export function validateQuantity(
  qty: number,
  maxQty?: number,
): { valid: boolean; message: string } {
  if (qty === null || qty === undefined || isNaN(qty)) {
    return { valid: false, message: '请输入有效数量' };
  }

  if (!Number.isInteger(qty)) {
    return { valid: false, message: '数量必须为正整数' };
  }

  if (qty <= 0) {
    return { valid: false, message: '数量必须大于 0' };
  }

  if (maxQty !== undefined && qty > maxQty) {
    return { valid: false, message: `数量不能超过 ${maxQty}` };
  }

  return { valid: true, message: '' };
}

/**
 * 校验收货地址必填字段
 *
 * @param data - 地址表单数据
 * @returns 错误信息映射表 { fieldName: errorMessage }，空对象表示全部通过
 */
export function validateAddress(data: {
  receiver_name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.receiver_name?.trim()) {
    errors.receiver_name = '请输入收件人姓名';
  }

  if (!data.phone?.trim()) {
    errors.phone = '请输入联系电话';
  } else if (!validatePhone(data.phone)) {
    errors.phone = '请输入正确的手机号';
  }

  if (!data.province?.trim()) {
    errors.province = '请选择省份';
  }

  if (!data.city?.trim()) {
    errors.city = '请选择城市';
  }

  if (!data.district?.trim()) {
    errors.district = '请选择区/县';
  }

  if (!data.detail?.trim()) {
    errors.detail = '请输入详细地址';
  }

  return errors;
}
