import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

/* 初始化 dayjs 插件和中文语言包 */
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

/**
 * 格式化日期为相对时间（如"3小时前"）
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

/**
 * 格式化日期为绝对时间（如"2024年1月15日 14:30"）
 * @param date - 日期字符串或 Date 对象
 * @param format - 格式化模板，默认完整日期时间
 * @returns 格式化后的日期字符串
 */
export function formatAbsoluteTime(
  date: string | Date,
  format: string = "YYYY年M月D日 HH:mm"
): string {
  return dayjs(date).format(format);
}

/**
 * 智能格式化日期：7天内显示相对时间，超过7天显示绝对时间
 * @param date - 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatSmartTime(date: string | Date): string {
  const diffDays = dayjs().diff(dayjs(date), "day");
  if (diffDays < 7) {
    return formatRelativeTime(date);
  }
  if (diffDays < 365) {
    return formatAbsoluteTime(date, "M月D日 HH:mm");
  }
  return formatAbsoluteTime(date, "YYYY年M月D日");
}

/**
 * 格式化日期为简短格式（如"1月15日"）
 * @param date - 日期字符串或 Date 对象
 * @returns 简短日期字符串
 */
export function formatShortDate(date: string | Date): string {
  return dayjs(date).format("M月D日");
}

export { dayjs };
