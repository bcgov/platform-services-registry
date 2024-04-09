'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Tabs, { ITab } from '@/components/generic/Tabs';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import { useSession } from 'next-auth/react';
import { getPublicCloudProject } from '@/services/backend/public-cloud';

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;
  const { data: session } = useSession({
    required: true,
  });

  const { data: currentProject } = useQuery({
    queryKey: ['currentProject', params.licencePlate],
    queryFn: () => getPublicCloudProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/public-cloud/product/${licencePlate}`,
    },
    {
      label: 'ROLES',
      name: 'aws-roles',
      href: `/public-cloud/aws-roles/${licencePlate}/admins`,
      ignoreSegments: 1,
    },
  ];

  if (session?.previews.history) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/public-cloud/history/${licencePlate}`,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={!currentProject?._permissions?.delete} />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
}
