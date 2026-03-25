import type { ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

export function PageLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}
