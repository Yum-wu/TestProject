# Week 2: Search 页面重构

**Goal:** Refactor Search into Enterprise Search Experience (not chatbot)

**Components:**
- SearchBar (centered input)
- StreamingAnswer (SSE rendering)
- CitationList (source panel)
- SourceCard (individual source)

---

## Task 1: 创建 SearchBar 组件

**File:** `src/components/search/SearchBar.tsx`

```tsx
import { FormEvent, KeyboardEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = 'Search enterprise knowledge...'
}: SearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl
                     text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                     focus:outline-none focus:border-[var(--accent)] transition-colors
                     disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg
                     bg-[var(--accent)] text-white
                     hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
```

---

## Task 2: 创建 StreamingAnswer 组件

**File:** `src/components/search/StreamingAnswer.tsx`

```tsx
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
  id: number;
  title: string;
  snippet: string;
  url?: string;
}

interface StreamingAnswerProps {
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export function StreamingAnswer({ content, citations = [], isStreaming }: StreamingAnswerProps) {
  const processedContent = useMemo(() => {
    return content.replace(/\[(\d+)\]/g, (_, num) => `**[${num}]**`);
  }, [content]);

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {processedContent}
      </ReactMarkdown>

      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-[var(--accent)] animate-pulse ml-1" />
      )}
    </div>
  );
}
```

---

## Task 3: 创建 CitationList 组件

**File:** `src/components/search/CitationList.tsx`

```tsx
interface Citation {
  id: number;
  title: string;
  snippet: string;
  url?: string;
}

interface CitationListProps {
  citations: Citation[];
}

export function CitationList({ citations }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">Sources</h3>
      {citations.map((citation) => (
        <div
          key={citation.id}
          className="p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg
                     hover:border-[var(--border-hover)] transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center
                           bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-medium rounded">
              {citation.id}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {citation.title}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                {citation.snippet}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Task 4: 创建 Search 页面

**File:** `src/pages/Search.tsx`

```tsx
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
```

---

## Commit

```bash
git add src/components/search/ src/pages/Search.tsx
git commit -m "feat: refactor Search page with enterprise search experience"
```
