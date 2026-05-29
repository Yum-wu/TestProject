import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
}

export function MetricCard({ label, value, suffix, change, changeLabel }: MetricCardProps) {
  return (
    <Card>
      <p className="text-[var(--text-secondary)] text-sm mb-2">{label}</p>
      <p className="text-4xl font-semibold text-[var(--text-primary)]">
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${change >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          {changeLabel && <span className="text-[var(--text-tertiary)] ml-1">{changeLabel}</span>}
        </p>
      )}
    </Card>
  );
}
