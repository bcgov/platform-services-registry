'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // PLACEHOLDER: any common error handling logic here?
    },
  }),
});

const Provider: React.FC<ProviderProps> = ({ children }: ProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

export default Provider;
