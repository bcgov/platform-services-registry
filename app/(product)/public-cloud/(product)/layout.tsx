'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { $Enums } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import Tabs, { ITab } from '@/components/generic/Tabs';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import { getPublicCloudRequestedProject } from '@/services/public-cloud';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;

  const { data } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => getPublicCloudRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

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
      ignoreSegments: 1,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions disabled={data?.type === $Enums.PublicCloudRequestType.DELETE || !!data} />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
}
