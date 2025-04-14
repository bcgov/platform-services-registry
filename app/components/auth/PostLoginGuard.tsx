'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
};

export default function PostLoginGuard({ status }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (status !== 'unauthenticated') return;

    const redirectPathStored = localStorage.getItem('postLoginRedirect');
    const currentFullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    if (!redirectPathStored && pathname !== '/home') {
      localStorage.setItem('postLoginRedirect', currentFullPath);
      router.replace('/home');
    }
  }, [status, pathname, searchParams, router]);

  return null;
}
