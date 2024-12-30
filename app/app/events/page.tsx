'use client';

import { useSnapshot } from 'valtio/react';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { pageState } from './state';

const eventsPage = createClientPage({
  permissions: [GlobalPermissions.ViewEvents],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default eventsPage(() => {
  const snap = useSnapshot({ pageState });

  return <div></div>;
});
