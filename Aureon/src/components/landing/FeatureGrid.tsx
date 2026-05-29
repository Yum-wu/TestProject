import { Card } from '../ui/Card';

const features = [
  {
    icon: '🔍',
    title: 'Hybrid Retrieval',
    description: 'BM25 keyword + Dense semantic dual-channel fusion',
    metric: '96.08% recall',
  },
  {
    icon: '⚡',
    title: 'Streaming Search',
    description: 'Real-time token-level SSE streaming with progressive rendering',
    metric: '310ms TTFT',
  },
  {
    icon: '📚',
    title: 'Citation UX',
    description: 'Inline citation markers with source preview',
    metric: '3 sources avg',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Latency, token usage, cache performance, query distribution',
    metric: 'Real-time',
  },
  {
    icon: '📄',
    title: 'Document Intelligence',
    description: 'Upload, auto-index, preview, source management',
    metric: 'Multi-format',
  },
  {
    icon: '🚀',
    title: 'Enterprise Deployment',
    description: 'Docker, CI/CD, production-grade infrastructure',
    metric: '24h setup',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((feature) => (
          <Card key={feature.title} hover>
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{feature.description}</p>
            <p className="text-sm text-[var(--accent)]">{feature.metric}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
