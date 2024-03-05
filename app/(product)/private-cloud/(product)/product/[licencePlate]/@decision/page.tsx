'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import ReturnModal from '@/components/modal/ReturnDecision';
import Comment from '@/components/modal/Comment';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import { useQuery, useMutation } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import { $Enums, PrivateCloudProject } from '@prisma/client';
import { makePriviateCloudRequestedDecision, getPriviateCloudActiveRequest } from '@/services/backend/private-cloud';

export default function RequestDecision({ params }: { params: { licencePlate: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [canDecide, setCanDecide] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [currentAction, setCurrentAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const { data: activeRequest } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['activeRequest', params.licencePlate],
    queryFn: () => getPriviateCloudActiveRequest(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const {
    mutateAsync: makeDecision,
    isPending: isMakingDecision,
    isError: isDecisionError,
    error: decisionError,
  } = useMutation({
    mutationFn: (data: any) => makePriviateCloudRequestedDecision(params.licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

  const methods = useForm({
    resolver: zodResolver(PrivateCloudDecisionRequestBodySchema),
    values: { decisionComment: '', decision: '', ...activeRequest?.requestedProject },
  });

  useEffect(() => {
    const _canDecide = !!(session?.isAdmin && activeRequest?.decisionStatus === 'PENDING');
    setCanDecide(_canDecide);
    if (_canDecide && activeRequest.type !== $Enums.RequestType.DELETE) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [session, activeRequest?.type, activeRequest?.decisionStatus]);

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const setComment = (decisionComment: string) => {
    makeDecision({ ...methods.getValues(), decisionComment });
  };

  useEffect(() => {
    if (activeRequest?.requestedProject.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [activeRequest]);

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
          <div className="mb-12 mt-8">
            {activeRequest && activeRequest.decisionStatus !== 'PENDING' && (
              <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-400 mb-3">
                A decision has already been made for this product
              </h3>
            )}
            <ProjectDescription
              disabled={isDisabled}
              clusterDisabled={activeRequest?.type !== 'CREATE'}
              mode="decision"
            />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={activeRequest?.licencePlate as string}
              disabled={isDisabled}
              currentProject={activeRequest?.project as PrivateCloudProject}
            />
          </div>

          {activeRequest?.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">{activeRequest?.requestComment}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {canDecide && (
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
            )}
          </div>
        </form>
      </FormProvider>
      <Comment
        open={openComment}
        setOpen={setOpenComment}
        onSubmit={setComment}
        isLoading={isMakingDecision}
        type={activeRequest?.type}
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/private-cloud/products/active-requests" />
    </div>
  );
}
