'use client';

import { useEffect, useState } from 'react';
import ProductHistoryTabs from '@/components/tabs/ProductHistoryTabs';
import { useRouter, usePathname } from 'next/navigation';

const tabsData = [
  {
    label: 'PRODUCT',
    name: 'product',
  },
  {
    label: 'HISTORY',
    name: 'history',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const licencePlate = pathname.split('/')[3];

  const [selectedTab, setSelectedTab] = useState('product');

  useEffect(() => {
    router.replace(`/private-cloud/${selectedTab}/${licencePlate}`);
  }, [selectedTab, licencePlate, router]);

  return (
    <div className="mt-6">
      <ProductHistoryTabs
        tabs={tabsData}
        selectedTab={selectedTab}
        onClick={(event) => setSelectedTab(event.target.name)}
      />
      <div className="mt-14"> {children}</div>
    </div>
  );
}
