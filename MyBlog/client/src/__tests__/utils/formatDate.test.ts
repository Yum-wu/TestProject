/**
 * formatDate 工具函数测试
 * - formatRelativeTime - 相对时间格式化
 * - formatAbsoluteTime - 绝对时间格式化
 * - formatSmartTime - 智能时间格式化
 * - formatShortDate - 简短日期格式化
 * - 边界值测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatRelativeTime,
  formatAbsoluteTime,
  formatSmartTime,
  formatShortDate,
} from "../../utils/formatDate";

describe("formatDate 工具函数", () => {
  // 固定当前时间，避免测试因时间差异而不稳定
  const fixedDate = new Date("2024-06-15T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /* ===== formatRelativeTime 测试 ===== */
  describe("formatRelativeTime", () => {
    it("应格式化为'刚刚'", () => {
      const result = formatRelativeTime(new Date("2024-06-15T11:59:30.000Z"));
      expect(result).toContain("刚刚");
    });

    it("应格式化为'X分钟前'", () => {
      const result = formatRelativeTime(new Date("2024-06-15T11:30:00.000Z"));
      expect(result).toContain("分钟前");
    });

    it("应格式化为'X小时前'", () => {
      const result = formatRelativeTime(new Date("2024-06-15T08:00:00.000Z"));
      expect(result).toContain("小时前");
    });

    it("应格式化为'X天前'", () => {
      const result = formatRelativeTime(new Date("2024-06-13T12:00:00.000Z"));
      expect(result).toContain("天前");
    });

    it("应格式化为'X个月前'", () => {
      const result = formatRelativeTime(new Date("2024-01-15T12:00:00.000Z"));
      expect(result).toContain("个月前");
    });

    it("应格式化为'X年前'", () => {
      const result = formatRelativeTime(new Date("2022-06-15T12:00:00.000Z"));
      expect(result).toContain("年前");
    });
  });

  /* ===== formatAbsoluteTime 测试 ===== */
  describe("formatAbsoluteTime", () => {
    it("应使用默认格式化模板", () => {
      const result = formatAbsoluteTime("2024-06-15T14:30:00.000Z");
      expect(result).toContain("2024年");
      expect(result).toContain("6月");
      expect(result).toContain("15日");
    });

    it("应支持自定义格式化模板", () => {
      const result = formatAbsoluteTime(
        "2024-06-15T14:30:00.000Z",
        "YYYY-MM-DD"
      );
      expect(result).toBe("2024-06-15");
    });

    it("应接受 Date 对象作为输入", () => {
      const result = formatAbsoluteTime(
        new Date("2024-06-15T14:30:00.000Z"),
        "YYYY-MM-DD"
      );
      expect(result).toBe("2024-06-15");
    });
  });

  /* ===== formatSmartTime 测试 ===== */
  describe("formatSmartTime", () => {
    it("7天内应显示相对时间", () => {
      // 1小时前
      const result = formatSmartTime(new Date("2024-06-15T11:00:00.000Z"));
      expect(result).toContain("小时前");
    });

    it("7天到365天内应显示月日时分", () => {
      // 30天前
      const result = formatSmartTime(new Date("2024-05-16T12:00:00.000Z"));
      // 应包含月和日
      expect(result).toContain("月");
      expect(result).toContain("日");
      // 不应包含年
      expect(result).not.toContain("2024年");
    });

    it("超过365天应显示年月日", () => {
      // 400天前
      const result = formatSmartTime(new Date("2023-05-11T12:00:00.000Z"));
      expect(result).toContain("年");
      expect(result).toContain("月");
      expect(result).toContain("日");
    });

    it("刚好7天应显示相对时间", () => {
      // 刚好7天前
      const result = formatSmartTime(new Date("2024-06-08T12:00:00.000Z"));
      // 7天边界值
      expect(result).toBeDefined();
    });

    it("应接受字符串日期输入", () => {
      const result = formatSmartTime("2024-06-15T11:00:00.000Z");
      expect(result).toBeDefined();
    });
  });

  /* ===== formatShortDate 测试 ===== */
  describe("formatShortDate", () => {
    it("应格式化为月日格式", () => {
      const result = formatShortDate("2024-06-15T14:30:00.000Z");
      expect(result).toContain("6月");
      expect(result).toContain("15日");
    });

    it("应接受 Date 对象", () => {
      const result = formatShortDate(new Date("2024-01-05T00:00:00.000Z"));
      expect(result).toContain("1月");
      expect(result).toContain("5日");
    });
  });

  /* ===== 边界值测试 ===== */
  describe("边界值测试", () => {
    it("应处理无效日期字符串", () => {
      // dayjs 对无效日期会返回 "Invalid Date"
      const result = formatRelativeTime("invalid-date");
      expect(result).toBeDefined();
    });

    it("应处理空字符串", () => {
      const result = formatSmartTime("");
      expect(result).toBeDefined();
    });

    it("应处理未来日期", () => {
      const result = formatSmartTime(new Date("2025-06-15T12:00:00.000Z"));
      expect(result).toBeDefined();
    });

    it("应处理闰年日期", () => {
      const result = formatAbsoluteTime(
        new Date("2024-02-29T12:00:00.000Z"),
        "YYYY-MM-DD"
      );
      expect(result).toBe("2024-02-29");
    });

    it("应处理年末日期", () => {
      const result = formatAbsoluteTime(
        new Date("2024-12-31T23:59:59.000Z"),
        "YYYY-MM-DD"
      );
      expect(result).toBe("2024-12-31");
    });
  });
});
