import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest, UpdateProfileRequest } from "../types";
import * as authService from "../services/auth";
import { getToken, setToken, clearAuth, setUser, getUser } from "../utils/storage";
import toast from "react-hot-toast";

/* ===== 认证状态类型 ===== */
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
}

/* ===== 认证操作类型 ===== */
type AuthAction =
  | { type: "AUTH_INIT"; payload: { user: User | null; token: string | null } }
  | { type: "AUTH_LOGIN"; payload: { user: User; token: string } }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_UPDATE_USER"; payload: User }
  | { type: "AUTH_SET_LOADING"; payload: boolean };

/* ===== 初始状态 ===== */
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  initialized: false,
};

/* ===== Reducer ===== */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_INIT":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        initialized: true,
      };
    case "AUTH_LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
      };
    case "AUTH_UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "AUTH_SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

/* ===== Context 类型 ===== */
interface AuthContextType {
  state: AuthState;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  isLoggedIn: boolean;
}

/* ===== 创建 Context ===== */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ===== Provider 组件 ===== */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /* 初始化：从 localStorage 恢复认证状态 */
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    dispatch({ type: "AUTH_INIT", payload: { user, token } });
  }, []);

  /* 登录 */
  const login = useCallback(async (data: LoginRequest) => {
    dispatch({ type: "AUTH_SET_LOADING", payload: true });
    try {
      const res = await authService.login(data);
      const { user, token } = res.data;
      setToken(token);
      setUser(user);
      dispatch({ type: "AUTH_LOGIN", payload: { user, token } });
      toast.success("登录成功");
    } catch (error) {
      dispatch({ type: "AUTH_SET_LOADING", payload: false });
      throw error;
    }
  }, []);

  /* 注册 */
  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: "AUTH_SET_LOADING", payload: true });
    try {
      const res = await authService.register(data);
      const { user, token } = res.data;
      setToken(token);
      setUser(user);
      dispatch({ type: "AUTH_LOGIN", payload: { user, token } });
      toast.success("注册成功");
    } catch (error) {
      dispatch({ type: "AUTH_SET_LOADING", payload: false });
      throw error;
    }
  }, []);

  /* 登出 */
  const logout = useCallback(() => {
    clearAuth();
    dispatch({ type: "AUTH_LOGOUT" });
    toast.success("已退出登录");
  }, []);

  /* 更新用户资料 */
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const res = await authService.updateProfile(data);
    const user = res.data;
    setUser(user);
    dispatch({ type: "AUTH_UPDATE_USER", payload: user });
    toast.success("资料更新成功");
  }, []);

  const isLoggedIn = !!state.token && !!state.user;

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateProfile,
    isLoggedIn,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

/* ===== 自定义 Hook ===== */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
}

export default useAuth;
