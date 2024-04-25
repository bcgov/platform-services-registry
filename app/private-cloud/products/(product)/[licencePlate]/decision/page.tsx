'use client';

import { z } from 'zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { PrivateCloudProject } from '@prisma/client';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import PreviousButton from '@/components/buttons/Previous';
import ReturnModal from '@/components/modal/ReturnDecision';
import Comment from '@/components/modal/Comment';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import SubmitButton from '@/components/buttons/SubmitButton';
import { makePriviateCloudRequestedDecision, getPriviateCloudRequest } from '@/services/backend/private-cloud';
import createClientPage from '@/core/client-page';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductDecision = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductDecision(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [currentAction, setCurrentAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const { data: activeRequest, isLoading: isActiveRequestLoading } = useQuery({
    queryKey: ['activeRequest', licencePlate],
    queryFn: () => getPriviateCloudRequest(licencePlate, true),
    enabled: !!licencePlate,
  });

  const {
    mutateAsync: makeDecision,
    isPending: isMakingDecision,
    isError: isDecisionError,
    error: decisionError,
  } = useMutation({
    mutationFn: (data: any) => makePriviateCloudRequestedDecision(licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

  const methods = useForm({
    resolver: zodResolver(PrivateCloudDecisionRequestBodySchema),
    values: { decisionComment: '', decision: '', ...activeRequest?.requestedProject },
  });

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

  if (isActiveRequestLoading || !activeRequest) {
    return null;
  }

  const isDisabled = !activeRequest._permissions.edit;

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
            {activeRequest.decisionStatus !== 'PENDING' && (
              <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-400 mb-3">
                A decision has already been made for this product
              </h3>
            )}
            <ProjectDescription
              disabled={isDisabled}
              clusterDisabled={activeRequest.type !== 'CREATE'}
              mode="decision"
            />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={activeRequest.licencePlate as string}
              disabled={isDisabled}
              currentProject={activeRequest.project as PrivateCloudProject}
            />
          </div>

          {activeRequest.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">{activeRequest.requestComment}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {activeRequest._permissions.review && (
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
        type={activeRequest.type}
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/private-cloud/requests/active" />
    </div>
  );
});
