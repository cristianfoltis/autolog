import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  readonly children: ReactNode;
}

export function Panel({ children }: Props) {
  return (
    <div className={cn('bg-surface rounded-2xl p-8 shadow-xl shadow-black/20')}>{children}</div>
  );
}
