'use client';

import ProductsRequestsTabs from '@/components/tabs/ProductsRequestsTabs';
import CreateProduct from '@/components/buttons/CreateProduct';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';

export default function DashboardLayout({
  children,
  context,
}: {
  children: React.ReactNode;
  context: 'private' | 'public';
}) {
  const tabs: ITab[] = [
    {
      label: 'PRIVATE CLOUD OPENSHIFT',
      name: 'private',
      href: '/private-cloud/products/all',
      ignoreSegments: 2,
    },
    {
      label: 'PUBLIC CLOUD LANDING ZONES',
      name: 'public',
      href: '/public-cloud/products/all',
      ignoreSegments: 2,
    },
  ];

  return (
    <div>
      <Tabs tabs={tabs}>
        <CreateProduct context={context} />
      </Tabs>
      <div className="mt-8">
        <ProductsRequestsTabs context={context} />
        {children}
      </div>
    </div>
  );
}
