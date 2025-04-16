'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import Landing from '@/components/Landing';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push('/home');
    } else {
      const callbackUrl = localStorage.getItem('postLoginRedirect');
      if (callbackUrl) {
        signIn('keycloak', { callbackUrl });
      }
    }
  }, [session, router]);

  return (
    <div className="my-12">
      <Landing />
    </div>
  );
}
