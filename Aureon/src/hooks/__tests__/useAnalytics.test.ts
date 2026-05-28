import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load analytics data successfully', async () => {
    const mockUsage = { total: 100, perHour: 5, byIntent: { general_qa: 60 }, trend: { change: 10, period: 'vs prev' } };
    const mockLatency = { avg: 15, p95: 30, p99: 50, breakdown: { retrieval: 10, llm_first_token: 300, llm_generation: 700 }, trend: { avg_change: -5, period: 'vs prev' } };
    const mockTokens = { input: 50000, output: 30000, total: 80000, cost: 25, costPerQuery: 0.001, model: 'gpt-4o-mini', trend: { input_change: 5, output_change: 3, period: 'vs prev' } };
    const mockCache = { hitRate: 75, saves: 200, latencyReduction: 40, memoryUsage: '128MB' };

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUsage) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockLatency) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockTokens) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCache) });

    const { result } = renderHook(() => useAnalytics('24h'));

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.usage).toEqual(mockUsage);
    expect(result.current.latency).toEqual(mockLatency);
    expect(result.current.tokens).toEqual(mockTokens);
    expect(result.current.cache).toEqual(mockCache);
  });

  it('should handle fetch failure gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAnalytics('24h'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.usage).toBeNull();
  });

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => useAnalytics('24h'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch analytics data');
  });
});
