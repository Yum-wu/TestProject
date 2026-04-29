import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "imageGenerationHistory";
const MAX_HISTORY_ITEMS = 20;
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB localStorage限制

// 安全保存localStorage
function safeSetItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn("数据超出localStorage限制");
      return false;
    }
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.error("localStorage容量已满，尝试清理旧数据");
      return false;
    }
    console.error("localStorage操作失败:", error);
    return false;
  }
}

// 安全读取localStorage
function safeGetItem(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error("读取localStorage失败:", error);
    return null;
  }
}

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = safeGetItem(STORAGE_KEY);
    if (savedHistory && Array.isArray(savedHistory)) {
      setHistory(savedHistory);
    }
  }, []);

  // 保存到历史记录
  const addToHistory = useCallback((imageData) => {
    if (!imageData) return;

    setHistory((prev) => {
      const newHistory = [imageData, ...prev].slice(0, MAX_HISTORY_ITEMS);

      const saved = safeSetItem(STORAGE_KEY, newHistory);
      if (!saved) {
        console.warn("历史记录保存失败，可能是容量限制");
      }

      return newHistory;
    });
  }, []);

  // 删除历史记录
  const deleteFromHistory = useCallback((id) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id);
      safeSetItem(STORAGE_KEY, newHistory);
      return newHistory;
    });
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("清空历史记录失败:", error);
    }
  }, []);

  // 切换历史记录显示
  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  return {
    history,
    showHistory,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    toggleHistory,
    setShowHistory,
  };
}
