import api from "./api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  ApiResponse,
} from "../types";

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

/**
 * 用户注册
 * POST /api/auth/register
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

/**
 * 获取当前用户信息
 * GET /api/auth/profile
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  const res = await api.get<ApiResponse<User>>("/auth/profile");
  return res.data;
}

/**
 * 更新用户资料
 * PUT /api/auth/profile
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiResponse<User>> {
  const res = await api.put<ApiResponse<User>>("/auth/profile", data);
  return res.data;
}
