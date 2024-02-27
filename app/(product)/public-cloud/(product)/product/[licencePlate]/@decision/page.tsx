'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import CreateModal from '@/components/modal/CreatePrivateCloud';
import ReturnModal from '@/components/modal/ReturnDecision';
import Comment from '@/components/modal/Comment';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import { useQuery } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import { $Enums, PublicCloudProject } from '@prisma/client';
import { getPublicCloudRequestedProject } from '@/services/public-cloud';

export default function RequestDecision({ params }: { params: { licencePlate: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [canDecide, setCanDecide] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const { data } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['requestedProject', params.licencePlate],
    queryFn: () => getPublicCloudRequestedProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const methods = useForm({
    resolver: zodResolver(PublicCloudDecisionRequestBodySchema),
    values: { comment: '', decision: '', ...data?.requestedProject },
  });

  useEffect(() => {
    const _canDecide = !!(session?.isAdmin && data?.decisionStatus === 'PENDING');
    setCanDecide(_canDecide);
    if (_canDecide && data.type !== $Enums.RequestType.DELETE) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [session, data, data?.decisionStatus]);

  const onSubmit = async (val: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/public-cloud/decision/${params.licencePlate}`, {
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
      setOpenReturn(true);
      setOpenComment(false);
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

  const setComment = (adminComment: string) => {
    onSubmit({ ...methods.getValues(), adminComment });
  };

  useEffect(() => {
    if (data?.requestedProject.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [data]);

  console.log('asdf', methods.formState);

  return (
    <div>
      <FormProvider {...methods}>
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(() => {
            if (methods.getValues('decision') === 'APPROVED') setOpenComment(true);
            if (methods.getValues('decision') === 'REJECTED') setOpenComment(true);
          })}
        >
          {data && data.decisionStatus !== 'PENDING' && (
            <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-400 mb-3">
              A decision has already been made for this product
            </h3>
          )}
          <div className="mb-12">
            <ProjectDescription disabled={isDisabled} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Budget disabled={isDisabled} />
            <AccountCoding accountCodingInitial={data?.requestedProject?.accountCoding} disabled={false} />
          </div>

          {data?.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">{data?.requestComment}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {canDecide ? (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton
                  text="REJECT REQUEST"
                  onClick={() => {
                    methods.setValue('decision', 'REJECTED');
                    setCurrentAction('REJECT');
                  }}
                />
                <SubmitButton
                  text="APPROVE REQUEST"
                  onClick={() => {
                    methods.setValue('decision', 'APPROVED');
                    setCurrentAction('APPROVE');
                  }}
                />
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
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/public-cloud/products/active-requests" />
    </div>
  );
}
