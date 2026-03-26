import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  readonly children: ReactNode;
}

export function PageLayout({ children }: Props) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-background px-4')}>
      {children}
    </div>
  );
}
