import CloudTabs from '@/components/tabs/CloudTabs';
import ProductsRequestsTabs from '@/components/tabs/ProductsRequestsTabs';

const tabsData = [
  {
    name: 'PRIVATE CLOUD OPENSHIFT',
    href: 'private-cloud',
    subHref: '',
  },
  {
    name: 'PUBLIC CLOUD LANDING ZONES',
    href: 'public-cloud',
    subHref: '',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs tabs={tabsData} />
      <div className="mt-8 mb-20 h-full mx-4 lg:mx-20">
        <ProductsRequestsTabs />
        {children}
      </div>
    </div>
  );
}
