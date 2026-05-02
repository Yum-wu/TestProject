/**
 * 订单号生成工具
 *
 * 格式: YYYYMMDDHHmmss + 4位随机数
 * 示例: 2026050112103847
 *
 * 在同一秒内创建多个订单时，依赖 4 位随机数保证唯一性。
 * 极端情况下 MySQL uk_order_no 唯一索引提供最终兜底。
 */

/**
 * 生成唯一订单号
 * @returns 格式为 YYYYMMDDHHmmss + 4位随机数的订单号字符串
 */
export function generateOrderNo(): string {
  const now = new Date();

  // 格式化日期时间部分: YYYYMMDDHHmmss
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  const datetimePart = `${year}${month}${day}${hour}${minute}${second}`;

  // 4 位随机数 (1000-9999)
  const randomPart = String(Math.floor(1000 + Math.random() * 9000));

  return datetimePart + randomPart;
}
