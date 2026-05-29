import { useState } from 'react';
import { SearchBar } from '../components/search/SearchBar';
import { StreamingAnswer } from '../components/search/StreamingAnswer';
import { CitationList } from '../components/search/CitationList';

interface Citation {
  id: number;
  title: string;
  snippet: string;
  url?: string;
}

export function Search() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setCitations([]);

    try {
      const response = await fetch('/api/rag/query/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) throw new Error('Search failed');

      const reader = response.body?.getReader();
      if (!reader) return;

      setIsStreaming(true);
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'token') {
                setAnswer(prev => prev + data.content);
              } else if (data.type === 'citations') {
                setCitations(data.citations);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setAnswer('Error: Failed to fetch answer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Enterprise Search</h1>
          <p className="text-[var(--text-secondary)]">
            AI-powered search across your knowledge base
          </p>
        </div>

        <div className="mb-8">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {(answer || isLoading) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
                <StreamingAnswer
                  content={answer}
                  citations={citations}
                  isStreaming={isStreaming}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 sticky top-8">
                <CitationList citations={citations} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
