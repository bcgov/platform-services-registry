'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import TeamContacts from '@/components/form/TeamContacts';
import { useQuery } from '@tanstack/react-query';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import { getPublicCloudRequest } from '@/services/backend/public-cloud';

export default function Request({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);

  const { data: projectRequest } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['projectRequest', params.id],
    queryFn: () => getPublicCloudRequest(params.id),
    enabled: !!params.id,
  });

  const methods = useForm({
    resolver: zodResolver(PublicCloudDecisionRequestBodySchema),
    values: { comment: '', decision: '', ...projectRequest?.requestedProject },
  });

  useEffect(() => {
    if (projectRequest && projectRequest.decisionStatus !== 'PENDING') {
      setDisabled(true);
    }
  }, [projectRequest]);

  // If user is not an admin, set isDisabled to true
  useEffect(() => {
    if (session && !session.isAdmin) {
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
            <ProjectDescription mode="view" disabled={isDisabled} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <ExpenseAuthority disabled={isDisabled} />
            <Budget disabled={false} />
            <AccountCoding accountCodingInitial={projectRequest?.requestedProject?.accountCoding} disabled={false} />
          </div>
          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
