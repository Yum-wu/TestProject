import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-secondary)]
        border border-[var(--border)]
        rounded-lg p-6
        ${hover ? 'hover:border-[var(--border-hover)] transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
