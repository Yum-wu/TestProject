/**
 * Input 组件测试
 * - 渲染测试
 * - 标签和提示测试
 * - 错误状态测试
 * - 图标测试
 * - 尺寸样式测试
 * - 交互测试
 * - 可访问性测试
 */

import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../../components/common/Input";

describe("Input 组件", () => {
  /* ===== 渲染测试 ===== */
  it("应正确渲染输入框", () => {
    render(<Input placeholder="请输入" />);
    expect(screen.getByPlaceholderText("请输入")).toBeInTheDocument();
  });

  it("应渲染 label 标签", () => {
    render(<Input label="用户名" />);
    expect(screen.getByLabelText("用户名")).toBeInTheDocument();
  });

  /* ===== 错误状态测试 ===== */
  it("有错误信息时应显示错误提示", () => {
    render(<Input error="用户名不能为空" />);
    expect(screen.getByText("用户名不能为空")).toBeInTheDocument();
  });

  it("有错误信息时输入框应显示错误样式", () => {
    render(<Input error="错误" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-300");
  });

  it("有错误信息时不应显示 hint", () => {
    render(<Input error="错误" hint="提示信息" />);
    expect(screen.queryByText("提示信息")).not.toBeInTheDocument();
    expect(screen.getByText("错误")).toBeInTheDocument();
  });

  /* ===== 提示文字测试 ===== */
  it("无错误时应显示 hint 提示", () => {
    render(<Input hint="请输入6-20个字符" />);
    expect(screen.getByText("请输入6-20个字符")).toBeInTheDocument();
  });

  /* ===== 图标测试 ===== */
  it("应渲染左侧图标", () => {
    const icon = <span data-testid="left-icon">L</span>;
    render(<Input icon={icon} />);
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
  });

  it("应渲染右侧图标", () => {
    const icon = <span data-testid="right-icon">R</span>;
    render(<Input rightIcon={icon} />);
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("有左侧图标时输入框应有左内边距", () => {
    const icon = <span>L</span>;
    render(<Input icon={icon} />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("pl-10");
  });

  it("有右侧图标时输入框应有右内边距", () => {
    const icon = <span>R</span>;
    render(<Input rightIcon={icon} />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("pr-10");
  });

  /* ===== 尺寸样式测试 ===== */
  it("默认尺寸应为 md", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("h-10");
  });

  it("sm 尺寸应正确应用", () => {
    render(<Input size="sm" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("h-8");
  });

  it("lg 尺寸应正确应用", () => {
    render(<Input size="lg" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("h-12");
  });

  /* ===== 交互测试 ===== */
  it("应支持用户输入", async () => {
    render(<Input placeholder="输入测试" />);
    const input = screen.getByPlaceholderText("输入测试");

    await userEvent.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("禁用状态下不应允许输入", () => {
    render(<Input disabled placeholder="禁用" />);
    const input = screen.getByPlaceholderText("禁用");
    expect(input).toBeDisabled();
  });

  it("禁用状态应有禁用样式", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("disabled:opacity-50");
  });

  it("应触发 onChange 回调", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await userEvent.type(input, "a");
    expect(handleChange).toHaveBeenCalled();
  });

  /* ===== 可访问性测试 ===== */
  it("label 和 input 应通过 htmlFor/id 关联", () => {
    render(<Input label="邮箱" id="email-input" />);
    const input = screen.getByLabelText("邮箱");
    expect(input).toHaveAttribute("id", "email-input");
  });

  it("无 id 时应自动生成 inputId", () => {
    render(<Input label="用户名" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id");
    expect(input.id).toContain("input-");
  });

  it("应支持 ref 转发", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("应支持 type 属性", () => {
    render(<Input type="password" />);
    const input = screen.getByRole("textbox") || document.querySelector('input[type="password"]');
    expect(input).toHaveAttribute("type", "password");
  });
});
