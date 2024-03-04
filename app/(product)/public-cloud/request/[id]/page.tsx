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

async function fetchRequestedProject(id: string): Promise<PublicCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/public-cloud/request/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok for fetch user image');
  }

  // Re format data to work with form
  const data = await res.json();

  // Secondaty technical lead should only be included if it exists
  if (data.requestedProject.secondaryTechnicalLead === null) {
    delete data.requestedProject.secondaryTechnicalLead;
  }

  return data;
}

export default function Request({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [open, setOpen] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);

  const { data } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.id],
    queryFn: () => fetchRequestedProject(params.id),
    enabled: !!params.id,
  });

  const methods = useForm({
    resolver: zodResolver(PublicCloudDecisionRequestBodySchema),
    values: { comment: '', decision: '', ...data?.requestedProject },
  });

  useEffect(() => {
    if (data && data.decisionStatus !== 'PENDING') {
      setDisabled(true);
    }
  }, [data]);

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
    if (data?.requestedProject.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [data]);

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpen(true))}>
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
            <AccountCoding accountCodingInitial={data?.requestedProject?.accountCoding} disabled={false} />
          </div>
          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
