'use client';

import { useState, useEffect, useRef } from 'react';
import ProductHistoryTabs from '@/components/tabs/ProductHistoryTabs';
import { useQuery } from '@tanstack/react-query';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { useSession } from 'next-auth/react';

const tabsData = [
  {
    label: 'PRODUCT',
    name: 'product',
  },
  {
    label: 'HISTORY',
    name: 'history',
  },
];

async function fetchRequestedProject(licencePlate: string): Promise<PrivateCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/public-cloud/active-request/${licencePlate}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  // Re format data to work with form
  const data = await res.json();

  // Secondaty technical lead should only be included if it exists
  if (data.requestedProject.secondaryTechnicalLead === null) {
    delete data.requestedProject.secondaryTechnicalLead;
  }

  return data;
}

export default function Layout({
  params,
  edit,
  decision,
  request,
}: {
  params: { licencePlate: string };
  edit: React.ReactNode;
  decision: React.ReactNode;
  request: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  const { data, isLoading } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => fetchRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const [selectedTab, setSelectedTab] = useState('product');

  if (isLoading) {
    return null;
  }

  if (selectedTab === 'history') {
    return null;
  }

  return (
    <div className="mt-6">
      <ProductHistoryTabs
        tabs={tabsData}
        selectedTab={selectedTab}
        onClick={(event) => setSelectedTab(event.target.name)}
      />
      {data ? (isAdmin ? decision : request) : edit}
    </div>
  );
}
