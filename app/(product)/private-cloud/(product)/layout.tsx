'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { $Enums } from '@prisma/client';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { getPriviateCloudActiveRequest } from '@/services/backend/private-cloud';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;

  // TODO: Fetching the requested project multiple times in both the layout and page levels may not be efficient.
  // Let's explore integrating a state management system for optimization as we proceed.
  const { data: activeRequest } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['activeRequest', licencePlate],
    queryFn: () => getPriviateCloudActiveRequest(licencePlate),
    enabled: !!params.licencePlate,
  });

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
        <PrivateCloudProductOptions disabled={activeRequest?.type === $Enums.RequestType.DELETE || !!activeRequest} />
      </Tabs>
      <div className="mt-14">{children}</div>
    </div>
  );
}
