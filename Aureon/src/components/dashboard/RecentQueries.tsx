import { Card } from '../ui/Card';

interface Query {
  id: string;
  query: string;
  latency: number;
  timestamp: string;
  status: 'success' | 'error' | 'timeout';
}

interface RecentQueriesProps {
  queries: Query[];
}

export function RecentQueries({ queries }: RecentQueriesProps) {
  const statusColors = {
    success: 'text-[var(--success)]',
    error: 'text-[var(--error)]',
    timeout: 'text-[var(--warning)]',
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Recent Queries</h3>
      <div className="space-y-3">
        {queries.map((query) => (
          <div key={query.id}
               className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">{query.query}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {new Date(query.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <span className="text-sm font-mono">{query.latency}ms</span>
              <span className={`text-xs font-medium ${statusColors[query.status]}`}>
                {query.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
