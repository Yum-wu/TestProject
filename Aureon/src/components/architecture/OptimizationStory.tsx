import { Card } from '../ui/Card';

interface Optimization {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

const optimizations: Optimization[] = [
  { metric: 'TTFT', before: '800ms', after: '310ms', improvement: '-61%' },
  { metric: 'Cache Hit Rate', before: '0%', after: '92%', improvement: '+92%' },
  { metric: 'Cost/Query', before: '$0.01', after: '$0.001', improvement: '-90%' },
  { metric: 'Retrieval Latency', before: '50ms', after: '10ms', improvement: '-80%' },
];

export function OptimizationStory() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {optimizations.map((opt) => (
        <Card key={opt.metric}>
          <h4 className="font-semibold mb-4">{opt.metric}</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm text-[var(--text-tertiary)]">Before</p>
              <p className="text-2xl font-bold text-[var(--error)]">{opt.before}</p>
            </div>
            <div className="text-4xl text-[var(--text-tertiary)]">→</div>
            <div className="text-center">
              <p className="text-sm text-[var(--text-tertiary)]">After</p>
              <p className="text-2xl font-bold text-[var(--success)]">{opt.after}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--text-tertiary)]">Improvement</p>
              <p className="text-2xl font-bold text-[var(--accent)]">{opt.improvement}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
