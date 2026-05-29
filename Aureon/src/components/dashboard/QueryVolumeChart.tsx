import { Card } from '../ui/Card';

interface DataPoint {
  date: string;
  count: number;
}

interface QueryVolumeChartProps {
  data: DataPoint[];
  title?: string;
}

export function QueryVolumeChart({ data, title = 'Query Volume' }: QueryVolumeChartProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-48">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-[var(--accent)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                 style={{ height: `${(point.count / maxCount) * 100}%` }}
            />
            <span className="text-xs text-[var(--text-tertiary)]">
              {new Date(point.date).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
