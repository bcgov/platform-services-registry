'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Landing from '@/components/Landing';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    router.push('/home');
  }

  return (
    <div className="my-12">
      <Landing />
    </div>
  );
}
