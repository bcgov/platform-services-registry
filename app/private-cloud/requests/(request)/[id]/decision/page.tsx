'use client';

import { z } from 'zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { $Enums, PrivateCloudProject } from '@prisma/client';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import PreviousButton from '@/components/buttons/Previous';
import ReturnModal from '@/components/modal/ReturnDecision';
import Comment from '@/components/modal/Comment';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import SubmitButton from '@/components/buttons/SubmitButton';
import { makePriviateCloudRequestDecision } from '@/services/backend/private-cloud/requests';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestDecision = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestDecision(({ pathParams, queryParams, session, router }) => {
  const [privateCloudState, privateCloudStateSnap] = usePrivateProductState();
  const { id } = pathParams;
  const [openReturn, setOpenReturn] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [currentAction, setCurrentAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const {
    mutateAsync: makeDecision,
    isPending: isMakingDecision,
    isError: isDecisionError,
    error: decisionError,
  } = useMutation({
    mutationFn: (data: any) => makePriviateCloudRequestDecision(id, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

  useEffect(() => {
    if (!privateCloudStateSnap.currentRequest) return;
    if (privateCloudStateSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [privateCloudStateSnap.currentRequest, router]);

  const methods = useForm({
    resolver: (...args) => {
      const isDeleteRequest = privateCloudStateSnap.currentRequest?.type === $Enums.RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values: {},
          errors: {},
        };
      }

      return zodResolver(PrivateCloudDecisionRequestBodySchema)(...args);
    },
    values: {
      decisionComment: '',
      decision: '',
      type: privateCloudStateSnap.currentRequest?.type,
      ...privateCloudStateSnap.currentRequest?.decisionData,
    },
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

  if (!privateCloudStateSnap.currentRequest) {
    return null;
  }

  const isDisabled = !privateCloudStateSnap.currentRequest._permissions.edit;

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
            {privateCloudStateSnap.currentRequest.decisionStatus !== 'PENDING' && (
              <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-400 mb-3">
                A decision has already been made for this product
              </h3>
            )}
            <ProjectDescription
              disabled={isDisabled}
              clusterDisabled={privateCloudStateSnap.currentRequest.type !== 'CREATE'}
              mode="decision"
            />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={privateCloudStateSnap.currentRequest.licencePlate as string}
              disabled={isDisabled}
              currentProject={privateCloudStateSnap.currentRequest.project as PrivateCloudProject}
            />
          </div>

          {privateCloudStateSnap.currentRequest.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
                {privateCloudStateSnap.currentRequest.requestComment}
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {privateCloudStateSnap.currentRequest._permissions.review && (
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
        type={privateCloudStateSnap.currentRequest.type}
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/private-cloud/requests/active" />
    </div>
  );
});
