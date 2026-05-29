import { MetricGrid } from '../components/dashboard/MetricGrid';
import { QueryVolumeChart } from '../components/dashboard/QueryVolumeChart';
import { RecentQueries } from '../components/dashboard/RecentQueries';
import { Card } from '../components/ui/Card';

// Mock data - replace with real API calls
const metrics = [
  { label: 'Total Queries', value: 1234, change: 12, changeLabel: 'vs last week' },
  { label: 'Avg Latency', value: 310, suffix: 'ms', change: -8, changeLabel: 'optimized' },
  { label: 'Cache Hit Rate', value: 92, suffix: '%', change: 5, changeLabel: 'improved' },
  { label: 'Success Rate', value: 99.2, suffix: '%', change: 0.3, changeLabel: 'stable' },
];

const queryVolume = [
  { date: '2026-05-23', count: 45 },
  { date: '2026-05-24', count: 52 },
  { date: '2026-05-25', count: 38 },
  { date: '2026-05-26', count: 61 },
  { date: '2026-05-27', count: 55 },
  { date: '2026-05-28', count: 48 },
  { date: '2026-05-29', count: 67 },
];

const recentQueries = [
  { id: '1', query: 'How to configure RBAC?', latency: 285, timestamp: '2026-05-29T10:30:00', status: 'success' as const },
  { id: '2', query: 'Explain hybrid retrieval', latency: 312, timestamp: '2026-05-29T10:28:00', status: 'success' as const },
  { id: '3', query: 'Deployment checklist', latency: 4500, timestamp: '2026-05-29T10:25:00', status: 'timeout' as const },
];

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Real-time metrics and system health monitoring
          </p>
        </div>

        <div className="space-y-8">
          <MetricGrid metrics={metrics} columns={4} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QueryVolumeChart data={queryVolume} />
            <RecentQueries queries={recentQueries} />
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                <div>
                  <p className="text-sm font-medium">API Server</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Healthy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                <div>
                  <p className="text-sm font-medium">Cache</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Active</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
