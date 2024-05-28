'use client';

import CreateProduct from '@/components/buttons/CreateProduct';
import Tabs, { ITab } from '@/components/generic/tabs/BasicTabs';
import ProductsRequestsTabs from '@/components/tabs/ProductsRequestsTabs';

export const tabs: ITab[] = [
  {
    label: 'HOME',
    name: 'home',
    href: '/home',
  },
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

export default function DashboardLayout({
  children,
  context,
}: {
  children: React.ReactNode;
  context: 'private' | 'public';
}) {
  return (
    <div>
      <Tabs tabs={tabs}>
        <CreateProduct context={context} />
      </Tabs>
      <div className="mt-6">
        <ProductsRequestsTabs context={context} />
        {children}
      </div>
    </div>
  );
}
