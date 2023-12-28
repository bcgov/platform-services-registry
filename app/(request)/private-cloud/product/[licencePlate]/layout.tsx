'use client';

import { useState, useEffect, useRef } from 'react';
import CloudTabs from '@/components/tabs/CloudTabsNew';
import { useQuery } from '@tanstack/react-query';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';

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
  const res = await fetch(`/api/private-cloud/active-request/${licencePlate}`);
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
}: {
  edit: React.ReactNode;
  decision: React.ReactNode;
  params: { licencePlate: string };
}) {
  const { data, isLoading } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => fetchRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const [selectedTab, setSelectedTab] = useState('product');

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <CloudTabs tabs={tabsData} selectedTab={selectedTab} onClick={(event) => setSelectedTab(event.target.name)} />
      {selectedTab === 'history' ? null : data ? decision : edit}
    </div>
  );
}
