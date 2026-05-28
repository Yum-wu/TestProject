import { useState, useEffect } from 'react';

interface AnalyticsData {
  latency: { avg: number; p95: number; p99: number };
  tokens: { input: number; output: number; cost: number };
  queries: { total: number; byIntent: Record<string, number> };
  cache: { hitRate: number; saves: number };
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    // TODO: 调用后端 /api/rag/analytics
    setData({
      latency: { avg: 10, p95: 25, p99: 50 },
      tokens: { input: 125000, output: 75000, cost: 45.5 },
      queries: { total: 143, byIntent: { '文档查询': 68, '代码搜索': 42, '通用问答': 33 } },
      cache: { hitRate: 78, saves: 320 }
    });
  }, [timeRange]);

  if (!data) return <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">系统性能与使用分析</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">最近 24 小时</option>
          <option value="7d">最近 7 天</option>
          <option value="30d">最近 30 天</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Latency */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-gray-500 text-sm mb-2">平均延迟</div>
          <div className="text-3xl font-bold text-gray-900">{data.latency.avg}<span className="text-lg text-gray-500">ms</span></div>
          <div className="mt-3 text-xs text-gray-400">
            P95: {data.latency.p95}ms · P99: {data.latency.p99}ms
          </div>
        </div>

        {/* Tokens */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-gray-500 text-sm mb-2">Token 消耗</div>
          <div className="text-3xl font-bold text-gray-900">{(data.tokens.input / 1000).toFixed(0)}k</div>
          <div className="mt-3 text-xs text-gray-400">
            输出: {(data.tokens.output / 1000).toFixed(0)}k · 成本: ${data.tokens.cost}
          </div>
        </div>

        {/* Queries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-gray-500 text-sm mb-2">查询总量</div>
          <div className="text-3xl font-bold text-gray-900">{data.queries.total}</div>
          <div className="mt-3 text-xs text-gray-400">
            平均 {Math.round(data.queries.total / 24)}/小时
          </div>
        </div>

        {/* Cache */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-gray-500 text-sm mb-2">缓存命中率</div>
          <div className="text-3xl font-bold text-blue-600">{data.cache.hitRate}%</div>
          <div className="mt-3 text-xs text-gray-400">
            节省 {data.cache.saves} 次查询
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Latency Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">延迟分布</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">Avg</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(data.latency.avg / 100) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">{data.latency.avg}ms</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">P95</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(data.latency.p95 / 100) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">{data.latency.p95}ms</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">P99</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(data.latency.p99 / 100) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">{data.latency.p99}ms</span>
            </div>
          </div>
        </div>

        {/* Query Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">查询分布</h3>
          <div className="space-y-3">
            {Object.entries(data.queries.byIntent).map(([intent, count], i) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-cyan-500'];
              const percentage = (count / data.queries.total) * 100;
              return (
                <div key={intent} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 truncate">{intent}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Token Usage Detail */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Token 使用详情</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-gray-500 text-sm mb-2">输入 Token</div>
            <div className="text-2xl font-bold text-gray-900">{(data.tokens.input / 1000).toFixed(1)}k</div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '62.5%' }} />
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm mb-2">输出 Token</div>
            <div className="text-2xl font-bold text-gray-900">{(data.tokens.output / 1000).toFixed(1)}k</div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '37.5%' }} />
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm mb-2">预估成本</div>
            <div className="text-2xl font-bold text-green-600">${data.tokens.cost}</div>
            <div className="mt-2 text-xs text-gray-400">~$0.001/查询</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
