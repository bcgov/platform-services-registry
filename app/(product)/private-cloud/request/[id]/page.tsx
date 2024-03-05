'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import { useQuery } from '@tanstack/react-query';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { PrivateCloudProject } from '@prisma/client';
import { getPriviateCloudRequest } from '@/services/backend/private-cloud';

export default function Request({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);

  const { data: projectRequest } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['projectRequest', params.id],
    queryFn: () => getPriviateCloudRequest(params.id),
    enabled: !!params.id,
  });

  const methods = useForm({
    resolver: zodResolver(PrivateCloudDecisionRequestBodySchema),
    values: { comment: '', decision: '', ...projectRequest?.requestedProject },
  });

  useEffect(() => {
    if (projectRequest && projectRequest.decisionStatus !== 'PENDING') {
      setDisabled(true);
    }
  }, [projectRequest]);

  // If user is not an admin, set isDisabled to true
  useEffect(() => {
    if (session && !session.user.isAdmin) {
      setDisabled(true);
    }
  }, [session]);

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  useEffect(() => {
    if (projectRequest?.requestedProject.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [projectRequest]);

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <div className="mb-12 mt-8">
            <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-400 mb-3">
              A decision has already been made for this product
            </h3>
            <ProjectDescription disabled={isDisabled} clusterDisabled={projectRequest?.type !== 'CREATE'} mode="view" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={projectRequest?.licencePlate as string}
              disabled={isDisabled}
              currentProject={projectRequest?.project as PrivateCloudProject}
            />
          </div>
          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
