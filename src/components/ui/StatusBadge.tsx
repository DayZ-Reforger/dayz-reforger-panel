import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
