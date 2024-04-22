'use client';

import CrumbsNav from '@/components/nav/CrumbsNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CrumbsNav cloudLabel="PUBLIC CLOUD" previousLabel="Products" />
      <div className="mt-12">{children}</div>
    </div>
  );
}
