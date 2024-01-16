'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
  });

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

  if (session?.previews.security) {
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
