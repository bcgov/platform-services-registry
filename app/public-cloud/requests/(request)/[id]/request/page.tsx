'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import AccountCoding from '@/components/form/AccountCoding';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import Comment from '@/components/modal/Comment';
import ReturnModal from '@/components/modal/ReturnDecision';
import createClientPage from '@/core/client-page';
import { PublicCloudRequestDecisionBodySchema } from '@/schema';
import { makePublicCloudRequestDecision } from '@/services/backend/public-cloud/requests';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductRequest = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductRequest(({ pathParams, queryParams, session, router }) => {
  const [publicState, publicSnap] = usePublicProductState();
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
    mutationFn: (data: any) => makePublicCloudRequestDecision(id, data),
    onSuccess: () => {
      setOpenReturn(true);
      setOpenComment(false);
    },
  });

  useEffect(() => {
    if (!publicSnap.currentRequest) return;

    if (publicSnap.currentRequest.active && !publicSnap.currentRequest._permissions.review) {
      router.push(`/public-cloud/requests/${publicSnap.currentRequest.id}/summary`);
      return;
    }

    if (publicSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [publicSnap.currentRequest, router]);

  const methods = useForm({
    resolver: (...args) => {
      const isDeleteRequest = publicSnap.currentRequest?.type === $Enums.RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values: {},
          errors: {},
        };
      }

      return zodResolver(PublicCloudRequestDecisionBodySchema)(...args);
    },
    values: {
      decisionComment: '',
      decision: '',
      type: publicSnap.currentRequest?.type,
      ...publicSnap.currentRequest?.decisionData,
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

  if (!publicSnap.currentRequest) {
    return null;
  }

  const isDisabled = !publicSnap.currentRequest._permissions.edit;

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
          {publicSnap.currentRequest.decisionStatus !== 'PENDING' && (
            <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
              A decision has already been made for this product.
            </Alert>
          )}
          <div className="mb-12">
            <ProjectDescription disabled={isDisabled} mode="decision" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <ExpenseAuthority disabled={isDisabled} />
            <Budget disabled={isDisabled} />
            <AccountCoding
              accountCodingInitial={publicSnap.currentRequest.decisionData?.accountCoding}
              disabled={isDisabled}
            />
          </div>

          {publicSnap.currentRequest.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="mt-4 text-base leading-6 text-gray-600">{publicSnap.currentRequest.requestComment}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {publicSnap.currentRequest._permissions.review ? (
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
      <Comment
        open={openComment}
        setOpen={setOpenComment}
        onSubmit={setComment}
        isLoading={isMakingDecision}
        type={publicSnap.currentRequest.type}
        action={currentAction}
      />
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/public-cloud/requests/active" />
    </div>
  );
});
