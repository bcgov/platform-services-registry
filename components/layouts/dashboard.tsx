'use client';

import CloudTabs from '@/components/tabs/CloudTabs';
import CreateButton from '@/components/buttons/CreateButton';
import ProductsRequestsTabs from '@/components/tabs/ProductsRequestsTabs';
import CreateProduct from '@/components/buttons/CreateProduct';

const urlFn = (path: string, name: string) => {
  const option = path.split('/')[3];
  return `/${name}-cloud/products/${option}`;
};

const tabsData = [
  {
    label: 'PRIVATE CLOUD OPENSHIFT',
    name: 'private',
  },
  {
    label: 'PUBLIC CLOUD LANDING ZONES',
    name: 'public',
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
      <CloudTabs tabs={tabsData} urlFn={urlFn} navItem={<CreateProduct context={context} />} />
      <div className="mt-8">
        <ProductsRequestsTabs />
        {children}
      </div>
    </div>
  );
}
