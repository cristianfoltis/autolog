import type { ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
}

export function Panel({ children }: Props) {
  return <div className="bg-surface rounded-2xl p-8 shadow-xl shadow-black/20">{children}</div>;
}
