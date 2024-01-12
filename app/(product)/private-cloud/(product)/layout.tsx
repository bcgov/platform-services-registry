'use client';

import { useParams } from 'next/navigation';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/private-cloud/product/${licencePlate}`,
    },
    {
      label: 'HISTORY',
      name: 'history',
      href: `/private-cloud/history/${licencePlate}`,
    },
  ];

  console.log('process.env.APP_ENV', process.env.APP_ENV);

  if (process.env.APP_ENV !== 'prod') {
    tabs.push({
      label: 'SECURITY',
      name: 'security',
      href: `/private-cloud/security/${licencePlate}/repository`,
      ignoreSegments: 1,
    });
  }
  return (
    <div>
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions disabled={false} />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
}
