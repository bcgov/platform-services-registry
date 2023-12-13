import CloudTabs from '@/components/tabs/CloudTabs';
import ProductsRequestsTabs from '@/components/tabs/ProductsRequestsTabs';
//public-cloud/edit/yFEeAiU/product
const tabsData = [
  {
    name: 'PUBLIC CLOUD EDIT',
    href: ``,
    subHref: 'product',
  },
  {
    name: 'PUBLIC CLOUD USER ROLES',
    href: '',
    subHref: 'roles',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs tabs={tabsData} />
      <div className="mt-8 mb-20 h-full mx-4 lg:mx-20">{children}</div>
    </div>
  );
}
