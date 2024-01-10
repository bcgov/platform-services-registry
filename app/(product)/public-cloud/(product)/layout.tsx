'use client';

import { useEffect, useState } from 'react';
import ProductHistoryTabs from '@/components/tabs/PublicCloudProductHistoryTabs';
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
  {
    label: 'ROLES',
    name: 'aws-roles',
  },
];

if (process.env.APP_ENV !== 'prod') {
  tabsData.push({
    label: 'ROLES',
    name: 'aws-roles',
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const licencePlate = pathname.split('/')[3];

  const [selectedTab, setSelectedTab] = useState('product');

  useEffect(() => {
    if (selectedTab === 'aws-roles') {
      router.replace(`/public-cloud/${selectedTab}/${licencePlate}/admins`);
    } else router.replace(`/public-cloud/${selectedTab}/${licencePlate}`);
  }, [selectedTab, licencePlate, router]);

  return (
    <div className="mt-12">
      <ProductHistoryTabs
        tabs={tabsData}
        selectedTab={selectedTab}
        onClick={(event) => setSelectedTab(event.target.name)}
      />
      <div className="mt-14"> {children}</div>
    </div>
  );
}
