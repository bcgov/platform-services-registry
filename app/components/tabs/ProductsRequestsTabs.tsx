import Tabs, { ITab } from '@/components/generic/tabs/SecondaryTabs';

export default function ProductsRequestsTabs({
  context,
  basePath,
}: {
  context: 'private' | 'public';
  basePath?: string;
}) {
  const hrefBase = basePath ?? `/${context}-cloud`;
  const tabs: ITab[] = [
    {
      label: 'Products',
      name: 'products',
      href: `${hrefBase}/products/all`,
    },
    {
      label: 'Requests',
      name: 'in-progress',
      href: `${hrefBase}/requests/all`,
    },
  ];

  return (
    <div>
      <Tabs tabs={tabs} className="mb-3" />
    </div>
  );
}
