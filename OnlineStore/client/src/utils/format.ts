/**
 * 格式化工具函数
 * 提供价格、日期、订单号等展示格式化
 */

/**
 * 格式化金额为人民币展示格式
 * @param price - 金额数值，单位：元
 * @param showSymbol - 是否显示货币符号，默认 true
 * @returns 格式化后的金额字符串，如 "¥129.00"
 *
 * @example
 * formatPrice(129)        // "¥129.00"
 * formatPrice(129.5)      // "¥129.50"
 * formatPrice(129, false) // "129.00"
 */
export function formatPrice(price: number, showSymbol = true): string {
  // 处理边界条件：非数字、null、undefined
  if (price === null || price === undefined || isNaN(price)) {
    return showSymbol ? '¥0.00' : '0.00';
  }

  const formatted = Number(price).toFixed(2);
  return showSymbol ? `¥${formatted}` : formatted;
}

/**
 * 格式化日期字符串为标准展示格式
 * @param dateStr - ISO 日期字符串或时间戳
 * @param includeTime - 是否包含时分，默认 true
 * @returns 格式化后的日期字符串，如 "2026-05-01 14:30"
 *
 * @example
 * formatDate('2026-05-01T14:30:00Z')  // "2026-05-01 14:30"
 * formatDate('2026-05-01T14:30:00Z', false) // "2026-05-01"
 */
export function formatDate(dateStr: string, includeTime = true): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  // 无效日期
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化订单编号（截取末尾用于快速识别）
 * @param orderNo - 完整订单编号
 * @param showFull - 是否显示完整编号
 * @returns 格式化后的订单编号
 */
export function formatOrderNo(orderNo: string, showFull = false): string {
  if (!orderNo) return '';
  if (showFull || orderNo.length <= 12) return orderNo;
  return `...${orderNo.slice(-8)}`;
}
