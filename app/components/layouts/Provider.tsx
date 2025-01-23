'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { success, failure } from '@/components/notification';

interface ProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({}),
  defaultOptions: {
    queries: {
      gcTime: 500, // remove cache data after 0.5 sec
    },
    mutations: {
      onSuccess: () => {
        success();
      },
      onError: (error) => {
        failure({ error });
      },
    },
  },
});

const Provider: React.FC<ProviderProps> = ({ children }: ProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};

export default Provider;
