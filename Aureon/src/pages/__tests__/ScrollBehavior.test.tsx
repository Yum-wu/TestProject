import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useBenchmark
vi.mock('../../hooks/useBenchmark', () => ({
  useBenchmark: () => ({
    data: {
      metrics: [
        { label: 'Recall@3 (Hybrid)', value: '96.08%' },
        { label: 'Streaming TTFT', value: '~310ms' },
      ],
    },
    loading: false,
  }),
}));

import Benchmark from '../Benchmark';
import Admin from '../Admin';

describe('Page Scroll Behavior', () => {
  describe('Benchmark Page', () => {
    it('should have scrollable container', () => {
      const { container } = render(
        <BrowserRouter>
          <Benchmark />
        </BrowserRouter>
      );

      // Find the main scrollable container
      const scrollable = container.querySelector('.overflow-y-auto');
      expect(scrollable).toBeInTheDocument();
    });

    it('should allow vertical scrolling when content overflows', () => {
      const { container } = render(
        <BrowserRouter>
          <Benchmark />
        </BrowserRouter>
      );

      const scrollable = container.querySelector('.overflow-y-auto');
      expect(scrollable).toHaveClass('overflow-y-auto');
    });
  });

  describe('Admin Page', () => {
    it('should have scrollable container', () => {
      const { container } = render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );

      // Find the main scrollable container
      const scrollable = container.querySelector('.overflow-y-auto');
      expect(scrollable).toBeInTheDocument();
    });

    it('should allow vertical scrolling when content overflows', () => {
      const { container } = render(
        <BrowserRouter>
          <Admin />
        </BrowserRouter>
      );

      const scrollable = container.querySelector('.overflow-y-auto');
      expect(scrollable).toHaveClass('overflow-y-auto');
    });
  });
});
