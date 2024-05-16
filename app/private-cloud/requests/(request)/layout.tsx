'use client';

import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div>
      <div className="my-2">{children}</div>
    </div>
  );
}
