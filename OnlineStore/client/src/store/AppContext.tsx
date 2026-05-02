import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

/** 全局应用 Context 类型 */
interface AppContextType {
  /** 全局加载状态 */
  loading: boolean;
  /** 设置全局加载状态 */
  setLoading: (v: boolean) => void;
  /** 全局错误信息 */
  error: string | null;
  /** 设置全局错误 */
  setError: (msg: string | null) => void;
  /** Toaster 消息 */
  toast: string | null;
  /** 显示 Toast 消息（自动消失） */
  showToast: (msg: string, duration?: number) => void;
}

/** 创建全局应用 Context */
const AppContext = createContext<AppContextType | null>(null);

/**
 * 应用全局 Provider
 * 提供全局 loading、error、toast 状态管理
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  /** 用 ref 追踪 toast 定时器，确保组件卸载时能清理 */
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /** 显示 Toast，默认 2 秒后自动消失 */
  const showToast = useCallback((msg: string, duration = 2000) => {
    setToast(msg);
    // 清除之前的定时器，避免多个 toast 积累
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <AppContext.Provider
      value={{ loading, setLoading, error, setError, toast, showToast }}
    >
      {children}
      {/* Toast 消息提示 */}
      {toast && <div className="toast toast-success">{toast}</div>}
    </AppContext.Provider>
  );
}

/**
 * 使用全局应用 Context 的 Hook
 */
export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext 必须在 AppProvider 内部使用");
  }
  return ctx;
}
