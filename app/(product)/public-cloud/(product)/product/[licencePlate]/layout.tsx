'use client';

import { useQuery } from '@tanstack/react-query';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import { useSession } from 'next-auth/react';

async function fetchRequestedProject(licencePlate: string): Promise<PublicCloudRequestWithCurrentAndRequestedProject> {
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
}: {
  params: { licencePlate: string };
  edit: React.ReactNode;
  decision: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  const { data, isLoading } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => fetchRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  if (isLoading) {
    return null;
  }

  return <div className="mt-6">{!data ? edit : decision}</div>;
}
