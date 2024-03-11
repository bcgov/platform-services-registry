'use client';

import { useParams } from 'next/navigation';
import { $Enums } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import Tabs, { ITab } from '@/components/generic/Tabs';
import PublicCloudProductOptions from '@/components/dropdowns/PublicCloudProductOptions';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import { getPublicCloudActiveRequest } from '@/services/backend/public-cloud';

export default function Layout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;

  const { data: activeRequest } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['activeRequest', params.licencePlate],
    queryFn: () => getPublicCloudActiveRequest(params.licencePlate),
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
    {
      label: 'ROLES',
      name: 'aws-roles',
      href: `/public-cloud/aws-roles/${licencePlate}/admins`,
      ignoreSegments: 1,
    },
  ];

  return (
    <div>
      <Tabs tabs={tabs}>
        <PublicCloudProductOptions
          disabled={activeRequest?.type === $Enums.PublicCloudRequestType.DELETE || !!activeRequest}
        />
      </Tabs>
      <div className="mt-14"> {children}</div>
    </div>
  );
}
