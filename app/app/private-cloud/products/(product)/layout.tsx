'use client';

import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import LightButton from '@/components/generic/button/LightButton';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div>
      <LightButton onClick={() => router.push('/private-cloud/products/all')} className="my-2">
        <IconArrowBack className="inline-block" />
        Back to Products
      </LightButton>
      <div className="my-2">{children}</div>
    </div>
  );
}
