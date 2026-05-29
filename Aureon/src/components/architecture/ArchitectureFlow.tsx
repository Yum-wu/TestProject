import { Card } from '../ui/Card';

interface PipelineStep {
  id: string;
  label: string;
  description: string;
  latency: string;
}

const pipelineSteps: PipelineStep[] = [
  { id: 'query', label: 'User Query', description: 'Natural language input', latency: '0ms' },
  { id: 'intent', label: 'Intent Classifier', description: 'Route to appropriate handler', latency: '5ms' },
  { id: 'retrieval', label: 'Hybrid Retrieval', description: 'BM25 + Dense semantic search', latency: '10ms' },
  { id: 'mmr', label: 'MMR Re-ranking', description: 'Maximal Marginal Relevance', latency: '3ms' },
  { id: 'prompt', label: 'Prompt Assembly', description: 'Context + query formatting', latency: '2ms' },
  { id: 'llm', label: 'LLM Generation', description: 'Streaming token generation', latency: '280ms' },
  { id: 'citation', label: 'Citation Injection', description: 'Source mapping & markers', latency: '5ms' },
  { id: 'sse', label: 'SSE Streaming', description: 'Real-time token delivery', latency: '5ms' },
];

export function ArchitectureFlow() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pipelineSteps.map((step, index) => (
          <div key={step.id} className="relative">
            <Card hover className="h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold rounded">
                  {index + 1}
                </span>
                <h4 className="font-semibold text-sm">{step.label}</h4>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">{step.description}</p>
              <p className="text-xs font-mono text-[var(--accent)]">{step.latency}</p>
            </Card>
            {index < pipelineSteps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-[var(--text-tertiary)]">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
