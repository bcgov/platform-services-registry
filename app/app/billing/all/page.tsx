'use client';

import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio/react';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchBilling } from '@/services/backend/billing';
import { SearchBilling } from '@/services/db/billing';
import { pageState } from './state';

const billingPage = createClientPage({
  permissions: [GlobalPermissions.ViewBilling],
  fallbackUrl: 'login?callbackUrl=/home',
});

export default billingPage(() => {
  const snap = useSnapshot(pageState);
  let totalCount = 0;
  let billings: SearchBilling[] = [];

  const { data, isLoading } = useQuery({
    queryKey: ['billings', snap],
    queryFn: () => searchBilling(snap),
  });

  if (!isLoading && data) {
    billings = data.data;
    totalCount = data.totalCount;
  }

  return <>{JSON.stringify(data?.data)}</>;
});
