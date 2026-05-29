import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock useAnalytics before importing Analytics
const mockUseAnalytics = vi.fn();
vi.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: (...args: unknown[]) => mockUseAnalytics(...args),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import Analytics from '../Analytics';

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockUseAnalytics.mockReturnValue({
      usage: null,
      latency: null,
      tokens: null,
      cache: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should show error state when data load fails', () => {
    const mockRefresh = vi.fn();
    mockUseAnalytics.mockReturnValue({
      usage: null,
      latency: null,
      tokens: null,
      cache: null,
      loading: false,
      error: 'Failed to fetch',
      refresh: mockRefresh,
    });

    render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    expect(screen.getByText('加载分析数据失败')).toBeInTheDocument();
    expect(screen.getByText('重试')).toBeInTheDocument();
  });

  it('should display data when loaded successfully', () => {
    mockUseAnalytics.mockReturnValue({
      usage: { total: 100, perHour: 5, byIntent: { general_qa: 60 }, trend: { change: 10, period: 'vs prev' } },
      latency: { avg: 15, p95: 30, p99: 50, breakdown: { retrieval: 10, llm_first_token: 300, llm_generation: 700 }, trend: { avg_change: -5, period: 'vs prev' } },
      tokens: { input: 50000, output: 30000, total: 80000, cost: 25, costPerQuery: 0.001, model: 'gpt-4o-mini', trend: { input_change: 5, output_change: 3, period: 'vs prev' } },
      cache: { hitRate: 75, saves: 200, latencyReduction: 40, memoryUsage: '128MB' },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Analytics />
      </BrowserRouter>
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
