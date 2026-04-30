/**
 * useAuth Hook 测试
 * - 初始状态测试
 * - 登录功能测试
 * - 注册功能测试
 * - 登出功能测试
 * - 更新资料测试
 * - Context 边界测试
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../hooks/useAuth";
import * as authService from "../../services/auth";
import * as storage from "../../utils/storage";
import type { User, AuthResponse } from "../../types";

// 模拟认证服务
vi.mock("../../services/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

// 模拟存储工具
vi.mock("../../utils/storage", () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearAuth: vi.fn(),
  setUser: vi.fn(),
  getUser: vi.fn(),
  removeToken: vi.fn(),
  removeUser: vi.fn(),
  getDarkMode: vi.fn(() => false),
  setDarkMode: vi.fn(),
}));

// 模拟用户数据
const mockUser: User = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  avatar: undefined,
  bio: undefined,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

const mockToken = "mock_jwt_token_12345";

const mockAuthResponse: AuthResponse = {
  code: 200,
  message: "操作成功",
  data: {
    user: mockUser,
    token: mockToken,
  },
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认返回未登录状态
    vi.mocked(storage.getToken).mockReturnValue(null);
    vi.mocked(storage.getUser).mockReturnValue(null);
  });

  /* ===== 初始状态测试 ===== */
  it("初始状态应为未登录", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.state.loading).toBe(false);
    expect(result.current.isLoggedIn).toBe(false);
  });

  it("初始化完成后 initialized 应为 true", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // useEffect 是异步的，需要等待
    expect(result.current.state.initialized).toBe(true);
  });

  it("localStorage 有 token 时应恢复登录状态", () => {
    vi.mocked(storage.getToken).mockReturnValue(mockToken);
    vi.mocked(storage.getUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.state.token).toBe(mockToken);
    expect(result.current.state.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });

  /* ===== 登录测试 ===== */
  it("登录成功应更新状态和存储", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(storage.setToken).toHaveBeenCalledWith(mockToken);
    expect(storage.setUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.state.user).toEqual(mockUser);
    expect(result.current.state.token).toBe(mockToken);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it("登录失败应保持未登录状态", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("登录失败"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(
      act(async () => {
        await result.current.login({
          email: "test@example.com",
          password: "wrong",
        });
      })
    ).rejects.toThrow("登录失败");

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.state.loading).toBe(false);
  });

  /* ===== 注册测试 ===== */
  it("注册成功应更新状态和存储", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      ...mockAuthResponse,
      code: 201,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.register({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      });
    });

    expect(authService.register).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });
    expect(storage.setToken).toHaveBeenCalledWith(mockToken);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it("注册失败应保持未登录状态", async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error("注册失败"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(
      act(async () => {
        await result.current.register({
          username: "newuser",
          email: "new@example.com",
          password: "password123",
        });
      })
    ).rejects.toThrow("注册失败");

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.state.loading).toBe(false);
  });

  /* ===== 登出测试 ===== */
  it("登出应清除状态和存储", () => {
    vi.mocked(storage.getToken).mockReturnValue(mockToken);
    vi.mocked(storage.getUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(storage.clearAuth).toHaveBeenCalled();
    expect(result.current.state.user).toBeNull();
    expect(result.current.state.token).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  /* ===== 更新资料测试 ===== */
  it("更新资料成功应更新用户状态", async () => {
    vi.mocked(storage.getToken).mockReturnValue(mockToken);
    vi.mocked(storage.getUser).mockReturnValue(mockUser);

    const updatedUser: User = {
      ...mockUser,
      bio: "新的个人简介",
    };

    vi.mocked(authService.updateProfile).mockResolvedValue({
      code: 200,
      message: "更新成功",
      data: updatedUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.updateProfile({ bio: "新的个人简介" });
    });

    expect(authService.updateProfile).toHaveBeenCalledWith({
      bio: "新的个人简介",
    });
    expect(storage.setUser).toHaveBeenCalledWith(updatedUser);
    expect(result.current.state.user?.bio).toBe("新的个人简介");
  });

  /* ===== Context 边界测试 ===== */
  it("在 AuthProvider 外部使用应抛出错误", () => {
    // 抑制 console.error
    const spy = vi.spyOn(console, "error");
    spy.mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth 必须在 AuthProvider 内部使用");

    spy.mockRestore();
  });

  /* ===== isLoggedIn 计算测试 ===== */
  it("isLoggedIn 应同时依赖 token 和 user", () => {
    // 只有 token 没有 user
    vi.mocked(storage.getToken).mockReturnValue(mockToken);
    vi.mocked(storage.getUser).mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // token 存在但 user 为 null，isLoggedIn 应为 false
    expect(result.current.isLoggedIn).toBe(false);
  });
});
