import { useState } from 'react'

const API_BASE = '/api'

function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedSource, setExpandedSource] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), top_k: 3, use_mmr: true }),
      })
      if (!res.ok) throw new Error(`请求失败: ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📚 RAG 知识库问答
        </h1>
        <p className="text-sm text-gray-500">
          基于 MyBlog 博文，检索增强生成
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入问题，如：Hermes Agent 有几层记忆？"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '查询中...' : '查询'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700">
          {error}
        </div>
      )}

      {/* Answer */}
      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                来源 ({result.sources.length})
              </h3>
              <div className="space-y-2">
                {result.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        📄 {src.title}
                      </span>
                      {src.score !== null && (
                        <span className="text-xs text-gray-400">
                          相关度: {(src.score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    {expandedSource === idx && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {src.chunk}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p>输入问题开始检索知识库</p>
          <p className="text-sm mt-2">
            试试：SPA 部署到 GitHub Pages 常见问题
          </p>
        </div>
      )}
    </div>
  )
}

export default App
