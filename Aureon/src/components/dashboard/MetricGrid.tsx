import { MetricCard } from '../ui/MetricCard';

interface Metric {
  label: string;
  value: string | number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
}

interface MetricGridProps {
  metrics: Metric[];
  columns?: 2 | 3 | 4;
}

export function MetricGrid({ metrics, columns = 3 }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
