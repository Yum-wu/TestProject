import { useBenchmark } from '../hooks/useBenchmark';

const Benchmark = () => {
  const { data: benchmark, loading } = useBenchmark();

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">加载中...</div>;

  return (
    <div className="h-full overflow-y-auto p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Architecture & Performance</h1>
        <p className="text-gray-500 text-sm">Production RAG 系统架构与性能指标</p>
      </div>

      {/* Runtime Metrics Hero */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {benchmark?.metrics?.map((m: any, i: number) => {
          const colors = ['from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400', 'from-green-500 to-emerald-400', 'from-amber-500 to-orange-400', 'from-red-500 to-rose-400'];
          return (
            <div key={i} className={`bg-gradient-to-br ${colors[i % colors.length]} rounded-xl p-5 text-white shadow-lg`}>
              <div className="text-3xl font-bold">{m.value}</div>
              <div className="text-sm opacity-90 mt-1">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 md:mb-6">系统架构</h3>
        {/* Desktop: Horizontal */}
        <div className="hidden md:flex items-center justify-center gap-3 lg:gap-4 flex-wrap text-sm">
          <div className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg border-2 border-blue-300">
            <div className="font-semibold">文档输入</div>
            <div className="text-xs opacity-75">PDF / MD / TXT</div>
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-purple-100 text-purple-700 px-4 py-3 rounded-lg border-2 border-purple-300">
            <div className="font-semibold">BGE Embedding</div>
            <div className="text-xs opacity-75">512d 本地推理</div>
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-cyan-100 text-cyan-700 px-4 py-3 rounded-lg border-2 border-cyan-300">
            <div className="font-semibold">Chroma DB</div>
            <div className="text-xs opacity-75">向量数据库</div>
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg border-2 border-green-300">
            <div className="font-semibold">Hybrid Search</div>
            <div className="text-xs opacity-75">BM25 + Dense</div>
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-amber-100 text-amber-700 px-4 py-3 rounded-lg border-2 border-amber-300">
            <div className="font-semibold">LLM</div>
            <div className="text-xs opacity-75">GLM-4-Flash</div>
          </div>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="bg-rose-100 text-rose-700 px-4 py-3 rounded-lg border-2 border-rose-300">
            <div className="font-semibold">SSE Streaming</div>
            <div className="text-xs opacity-75">实时输出</div>
          </div>
        </div>

        {/* Mobile: Vertical */}
        <div className="md:hidden space-y-2">
          {[
            { name: '文档输入', detail: 'PDF / MD / TXT', color: 'blue' },
            { name: 'BGE Embedding', detail: '512d 本地推理', color: 'purple' },
            { name: 'Chroma DB', detail: '向量数据库', color: 'cyan' },
            { name: 'Hybrid Search', detail: 'BM25 + Dense', color: 'green' },
            { name: 'LLM', detail: 'GLM-4-Flash', color: 'amber' },
            { name: 'SSE Streaming', detail: '实时输出', color: 'rose' },
          ].map((item, i) => (
            <div key={i} className={`bg-${item.color}-100 text-${item.color}-700 px-4 py-3 rounded-lg border-2 border-${item.color}-300`}>
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs opacity-75">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">TTFT 优化历程</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">优化前</span>
                <span className="text-red-500 font-medium">500ms</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full w-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">优化后</span>
                <span className="text-green-600 font-medium">310ms</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              提升 38%：检索-生成并行化 + 缓存预热 + 流式架构
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">检索准确率</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Dense Only</span>
                <span className="text-blue-500 font-medium">90.2%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '90.2%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hybrid (BM25 + Dense)</span>
                <span className="text-green-600 font-medium">96.08%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '96.08%' }} />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              51 QA Pairs 基准测试 · 95% CI: 88-99%
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">技术栈</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">Embedding</div>
            <div className="text-gray-600">BGE-large-zh-v1.5</div>
            <div className="text-xs text-gray-400">512d · 本地推理 · ~7ms</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">向量数据库</div>
            <div className="text-gray-600">ChromaDB</div>
            <div className="text-xs text-gray-400">持久化 · 本地部署</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">检索策略</div>
            <div className="text-gray-600">Hybrid Search</div>
            <div className="text-xs text-gray-400">BM25 + Dense 融合</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">缓存</div>
            <div className="text-gray-600">Redis + In-memory</div>
            <div className="text-xs text-gray-400">多级缓存 · 78% 命中率</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benchmark;
