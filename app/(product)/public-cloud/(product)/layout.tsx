'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Tabs, { ITab } from '@/components/generic/Tabs';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';

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
      href: `/public-cloud/product/${licencePlate}`,
    },
    {
      label: 'HISTORY',
      name: 'history',
      href: `/public-cloud/history/${licencePlate}`,
    },
  ];

  if (session?.previews.awsRoles) {
    tabs.push({
      label: 'ROLES',
      name: 'aws-roles',
      href: `/public-cloud/aws-roles/${licencePlate}/admins`,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={false} />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
}
