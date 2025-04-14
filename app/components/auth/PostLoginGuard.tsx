'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function PostLoginGuard() {
  const { status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (status !== 'unauthenticated') return;

    const redirectAlreadySet = localStorage.getItem('postLoginRedirect');
    const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    if (!redirectAlreadySet && pathname !== '/home') {
      localStorage.setItem('postLoginRedirect', currentPath);
      router.replace('/home');
    }
  }, [status, pathname, searchParams, router]);

  return null;
}
