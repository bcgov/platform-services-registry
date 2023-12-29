'use client';

import { useQuery } from '@tanstack/react-query';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { useSession } from 'next-auth/react';

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

  if (isLoading) {
    return null;
  }

  return <div className="mt-6">{!data ? edit : isAdmin ? decision : request}</div>;
}
