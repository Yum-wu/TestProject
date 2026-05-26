import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChat } from "./useChat";
import { streamChat } from "../services/api";
import { loadMessages, saveMessages, clearMessages } from "../services/storage";
import type { Message } from "../types/message";
import type { SSEEvent } from "../services/api";

// Mock modules
vi.mock("../services/api");
vi.mock("../services/storage");
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  default: { t: (key: string) => key },
}));

// i18next mock for useChat's direct import
vi.mock("i18next", () => ({
  default: { t: (key: string) => key },
  t: (key: string) => key,
}));

const sampleMessages: Message[] = [
  { id: "s1", role: "user", content: "Hi", timestamp: 1000 },
  { id: "s2", role: "assistant", content: "Hello!", timestamp: 2000 },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadMessages).mockReturnValue([]);
  vi.mocked(saveMessages).mockImplementation(() => {});
  vi.mocked(clearMessages).mockImplementation(() => {});
  vi.mocked(streamChat).mockResolvedValue();
  localStorage.clear();
});

describe("useChat", () => {
  it("should initialize with loaded messages", () => {
    vi.mocked(loadMessages).mockReturnValue(sampleMessages);

    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual(sampleMessages[0]);
    expect(result.current.messages[1]).toEqual(sampleMessages[1]);
  });

  it("should send a message and create user + assistant messages", async () => {
    vi.mocked(streamChat).mockResolvedValue();

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("hello");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[0].content).toBe("hello");
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].content).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  it("should clear chat and abort ongoing request", async () => {
    vi.mocked(streamChat).mockResolvedValue();

    const { result } = renderHook(() => useChat());

    // First send a message
    await act(async () => {
      await result.current.sendMessage("hello");
    });

    expect(result.current.messages).toHaveLength(2);

    // Then clear
    await act(async () => {
      result.current.clearChat();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
    expect(vi.mocked(clearMessages)).toHaveBeenCalled();
  });

  it("should stop generation and mark last assistant message", async () => {
    // Capture the onEvent callback so we can simulate text arrival
    let capturedOnEvent: ((event: SSEEvent) => void) | undefined;
    vi.mocked(streamChat).mockImplementation(async ({ onEvent }) => {
      capturedOnEvent = onEvent;
      // Never resolve — we'll stop mid-stream
      return new Promise<void>(() => {});
    });

    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage("hello");
    });

    // After the synchronous part of sendMessage, messages are created
    await vi.waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.isLoading).toBe(true);
    });

    // Send partial text content, then stop in one batch
    act(() => {
      capturedOnEvent?.({ type: "text", content: "Partial " });
      capturedOnEvent?.({ type: "text", content: "response" });
      result.current.stopGeneration();
    });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      // The assistant message should have both the partial text and the stopped marker
      expect(result.current.messages[1].role).toBe("assistant");
      expect(result.current.messages[1].content).toContain("Partial response");
      expect(result.current.messages[1].content).toContain("chat.stopped");
    });
  });

  it("should handle error from streamChat", async () => {
    vi.mocked(streamChat).mockImplementation(async ({ onError }) => {
      onError("Test error message");
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("hello");
    });

    expect(result.current.error).toBe("Test error message");
  });

  it("should clear error", async () => {
    // Set up streamChat to trigger an error
    vi.mocked(streamChat).mockImplementation(async ({ onError }) => {
      onError("Test error message");
    });

    const { result } = renderHook(() => useChat());

    // Trigger the error
    await act(async () => {
      await result.current.sendMessage("hello");
    });

    expect(result.current.error).toBe("Test error message");

    // Clear it
    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
