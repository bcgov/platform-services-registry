'use client';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import PrivateCloudProductOptions from '@/components/dropdowns/PrivateCloudProductOptions';
import Tabs, { ITab } from '@/components/generic/Tabs';
import { getPriviateCloudProject } from '@/services/backend/private-cloud';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const params = useParams<{ licencePlate: string }>();
  const { licencePlate } = params;

  // TODO: Fetching the requested project multiple times in both the layout and page levels may not be efficient.
  // Let's explore integrating a state management system for optimization as we proceed.
  const { data: currentProject } = useQuery({
    queryKey: ['currentProject', licencePlate],
    queryFn: () => getPriviateCloudProject(licencePlate),
    enabled: !!params.licencePlate,
  });

  const tabs: ITab[] = [
    {
      label: 'PRODUCT',
      name: 'product',
      href: `/private-cloud/product/${licencePlate}`,
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

  if (session?.previews.history) {
    tabs.push({
      label: 'HISTORY',
      name: 'history',
      href: `/private-cloud/history/${licencePlate}`,
    });
  }

  return (
    <div>
      <Tabs tabs={tabs}>
        <PrivateCloudProductOptions
          licensePlace={currentProject?.licencePlate}
          canReprovision={currentProject?._permissions?.reprovision}
          canResend={currentProject?._permissions?.resend}
          canDelete={currentProject?._permissions?.delete}
        />
      </Tabs>
      <div className="mt-14">{children}</div>
      <ToastContainer />
    </div>
  );
}
