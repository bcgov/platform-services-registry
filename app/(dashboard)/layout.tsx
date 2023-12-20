'use client';

import CloudTabs from '@/components/tabs/CloudTabs';
import CreateButton from '@/components/buttons/CreateButton';

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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs tabs={tabsData} urlFn={urlFn} navItem={<CreateButton />} />
      <div className="mt-8 mb-20 h-full mx-4 lg:mx-20">{children}</div>
    </div>
  );
}
