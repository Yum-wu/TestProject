/**
 * Button 组件测试
 * - 渲染测试
 * - 变体样式测试
 * - 尺寸样式测试
 * - 交互测试（点击、禁用、加载）
 * - 可访问性测试
 */

import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../../components/common/Button";

describe("Button 组件", () => {
  /* ===== 渲染测试 ===== */
  it("应正确渲染按钮文本", () => {
    render(<Button>点击我</Button>);
    expect(screen.getByRole("button", { name: "点击我" })).toBeInTheDocument();
  });

  it("应正确渲染图标", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(<Button icon={icon}>带图标</Button>);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  /* ===== 变体样式测试 ===== */
  it("默认变体应为 primary", () => {
    render(<Button>默认</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("from-primary-500");
  });

  it("secondary 变体应正确应用样式", () => {
    render(<Button variant="secondary">次要</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-neutral-100");
  });

  it("danger 变体应正确应用样式", () => {
    render(<Button variant="danger">危险</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("from-red-500");
  });

  it("ghost 变体应正确应用样式", () => {
    render(<Button variant="ghost">幽灵</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-transparent");
  });

  /* ===== 尺寸样式测试 ===== */
  it("默认尺寸应为 md", () => {
    render(<Button>默认尺寸</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
  });

  it("sm 尺寸应正确应用", () => {
    render(<Button size="sm">小按钮</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-8");
  });

  it("lg 尺寸应正确应用", () => {
    render(<Button size="lg">大按钮</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-12");
  });

  /* ===== 交互测试 ===== */
  it("点击时应触发 onClick 回调", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>可点击</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("禁用状态下不应触发 onClick", async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>禁用</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("加载状态下应禁用按钮", () => {
    render(<Button loading>加载中</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:opacity-50");
  });

  it("加载状态下应显示加载动画", () => {
    render(<Button loading>加载中</Button>);
    // 加载动画是一个 SVG 元素
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg.animate-spin");
    expect(svg).toBeInTheDocument();
  });

  it("加载状态下不应显示图标", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(<Button loading icon={icon}>加载中</Button>);
    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });

  /* ===== fullWidth 测试 ===== */
  it("fullWidth 应添加 w-full 类", () => {
    render(<Button fullWidth>全宽</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("w-full");
  });

  /* ===== 可访问性测试 ===== */
  it("应支持 type 属性", () => {
    render(<Button type="submit">提交</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("应支持 aria-label 属性", () => {
    render(<Button aria-label="关闭对话框">X</Button>);
    expect(screen.getByLabelText("关闭对话框")).toBeInTheDocument();
  });

  it("应支持 ref 转发", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});
