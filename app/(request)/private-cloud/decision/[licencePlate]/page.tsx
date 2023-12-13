'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import CreateModal from '@/components/modal/CreatePrivateCloud';
import ReturnModal from '@/components/modal/ReturnDecision';
import Comment from '@/components/modal/Comment';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import { useQuery } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { PrivateCloudProject } from '@prisma/client';

async function fetchRequestedProject(licencePlate: string): Promise<PrivateCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/private-cloud/active-request/${licencePlate}`);
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

export default function RequestDecision({ params }: { params: { licencePlate: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => fetchRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const methods = useForm({
    resolver: zodResolver(PrivateCloudDecisionRequestBodySchema),
    values: { humanCommnet: '', decision: '', ...data?.requestedProject },
  });

  useEffect(() => {
    if (data && data.decisionStatus !== 'PENDING') {
      setDisabled(true);
    }
  }, [data]);

  const onSubmit = async (val: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/private-cloud/decision/${params.licencePlate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(val),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok for create request');
      }

      setOpenCreate(false);
      setOpenComment(false);
      setOpenReturn(true);
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
    }
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const setComment = (comment: string) => {
    onSubmit({ ...methods.getValues(), comment });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(() => {
            if (methods.getValues('decision') === 'APPROVED') setOpenCreate(true);
            if (methods.getValues('decision') === 'REJECTED') setOpenComment(true);
          })}
        >
          <div className="mb-12 mt-8">
            {isDisabled && (
              <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-600 mb-5">
                A decision has already been made for this project
              </h3>
            )}
            <ProjectDescription disabled={isDisabled} clusterDisabled={data?.type !== 'CREATE'} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={data?.licencePlate as string}
              disabled={isDisabled}
              currentProject={data?.project as PrivateCloudProject}
            />
          </div>
          <div className="border-b border-gray-900/10 pb-14">
            <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
              4. User Comments
            </h2>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">{data?.userComment}</p>
          </div>

          <div className="mt-16 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {!isDisabled && session?.user?.roles?.includes('admin') ? (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton text="REJECT REQUEST" onClick={() => methods.setValue('decision', 'REJECTED')} />
                <SubmitButton text="APPROVE REQUEST" onClick={() => methods.setValue('decision', 'APPROVED')} />
              </div>
            ) : null}
          </div>
        </form>
      </FormProvider>
      <CreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        handleSubmit={methods.handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
      <Comment
        open={openComment}
        setOpen={setOpenComment}
        onSubmit={setComment}
        isLoading={isLoading}
        type={data?.type}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/private-cloud/requests" />
    </div>
  );
}
