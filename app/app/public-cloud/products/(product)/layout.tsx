'use client';

import { Button } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div>
      <Button
        leftSection={<IconArrowBack />}
        color="dark"
        variant="outline"
        onClick={() => router.push('/public-cloud/products/all')}
        className="my-2"
      >
        Back to Products
      </Button>
      <div className="my-2">{children}</div>
    </div>
  );
}
