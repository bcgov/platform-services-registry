import Tabs, { ITab } from '@/components/generic/tabs/SecondaryTabs';

export default function ProductsRequestsTabs({ context }: { context: 'private' | 'public' }) {
  const tabs: ITab[] = [
    {
      label: 'Products',
      name: 'products',
      href: `/${context}-cloud/products/all`,
    },
    {
      label: 'Requests',
      name: 'in-progress',
      href: `/${context}-cloud/requests/all`,
    },
  ];

  return (
    <div>
      <Tabs tabs={tabs} className="mb-6" />
    </div>
  );
}
