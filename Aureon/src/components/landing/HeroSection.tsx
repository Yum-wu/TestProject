import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function HeroSection() {
  return (
    <section className="py-24 px-4 text-center">
      <Badge variant="success">Production Ready</Badge>

      <h1 className="text-5xl font-bold mt-6 mb-4">
        Production AI Search
        <br />
        for Enterprise Knowledge
      </h1>

      <p className="text-[var(--text-secondary)] text-xl max-w-2xl mx-auto mb-8">
        Enterprise-grade hybrid retrieval platform with streaming answers,
        citations, and real-time analytics.
      </p>

      <div className="flex gap-8 justify-center mb-10">
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">96.08%</p>
          <p className="text-[var(--text-secondary)] text-sm">Recall@3</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">310ms</p>
          <p className="text-[var(--text-secondary)] text-sm">TTFT</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-[var(--accent)]">$0.001</p>
          <p className="text-[var(--text-secondary)] text-sm">per Query</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button size="lg">Start Searching</Button>
        <Button variant="secondary" size="lg">View Architecture</Button>
      </div>
    </section>
  );
}
