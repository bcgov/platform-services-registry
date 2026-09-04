'use client';

import { Alert, Button } from '@mantine/core';

function queryErrorMessage(error: unknown, fallback: string) {
  const axiosMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (axiosMessage) return axiosMessage;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function FinanceQueryError({
  error,
  onRetry,
  title = 'Could not load finance data',
}: Readonly<{
  error: unknown;
  onRetry: () => void;
  title?: string;
}>) {
  return (
    <Alert color="red" title={title}>
      <p className="mb-3">{queryErrorMessage(error, title)}</p>
      <Button type="button" size="xs" variant="light" onClick={onRetry}>
        Retry
      </Button>
    </Alert>
  );
}
