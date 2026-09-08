'use client';

import type { ReactNode } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import FinanceQueryError from '@/components/public-cloud/finance/FinanceQueryError';

export default function FinanceQueryState({
  isError,
  error,
  onRetry,
  title,
  isReady,
  children,
}: Readonly<{
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  title: string;
  isReady: boolean;
  children: ReactNode;
}>) {
  if (isError) {
    return <FinanceQueryError error={error} onRetry={onRetry} title={title} />;
  }
  if (!isReady) {
    return (
      <LoadingBox isLoading>
        <div className="min-h-24" />
      </LoadingBox>
    );
  }
  return children;
}
