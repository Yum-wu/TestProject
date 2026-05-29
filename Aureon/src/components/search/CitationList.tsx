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
