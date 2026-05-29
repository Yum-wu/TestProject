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

export function StreamingAnswer({ content, isStreaming }: StreamingAnswerProps) {
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
