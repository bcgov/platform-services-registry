'use client';

import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Landing from '@/components/Landing';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const callbackUrl = localStorage.getItem('postLoginRedirect');

  if (session) {
    router.push('/home');
  }

  if (callbackUrl) {
    signIn('keycloak', { callbackUrl: callbackUrl });
  }

  return (
    <div className="my-12">
      <Landing />
    </div>
  );
}
