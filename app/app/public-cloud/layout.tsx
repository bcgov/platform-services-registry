'use client';

import { useEffect } from 'react';
import { appState } from '@/states/global';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    appState.cloud = 'public-cloud';
  }, [appState]);

  return <div className="">{children}</div>;
}
