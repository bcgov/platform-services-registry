'use client';

import CrumbsNav from '@/components/nav/CrumbsNav';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const previousLabel = pathname.split('/')[2];
  const currentLabel = pathname.split('/')[3];

  return (
    <div>
      <CrumbsNav cloudLabel="PRIVATE CLOUD" currentLabel={currentLabel} previousLabel={previousLabel} />
      <div className="mt-12">{children}</div>
    </div>
  );
}
