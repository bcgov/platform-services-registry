'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { Prisma, $Enums, Provider } from '@prisma/client';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconSettings,
  IconComponents,
  IconMessage,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PublicCloudBillingInfo from '@/components/billing/PublicCloudBillingInfo';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import PageAccordion from '@/components/form/PageAccordion';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import Comment from '@/components/modal/Comment';
import ReturnModal from '@/components/modal/ReturnDecision';
import { openReviewPublicCloudProductModal } from '@/components/modal/reviewPublicCloudProductModal';
import { openSignPublicCloudProductModal } from '@/components/modal/signPublicCloudProductModal';
import createClientPage from '@/core/client-page';
import { showErrorNotification } from '@/helpers/notifications';
import { makePublicCloudRequestDecision } from '@/services/backend/public-cloud/requests';
import { usePublicProductState } from '@/states/global';
import { publicCloudRequestDecisionBodySchema } from '@/validation-schemas/public-cloud';

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
    onError: (error: any) => {
      showErrorNotification(error);
    },
  });

  useEffect(() => {
    if (!publicSnap.currentRequest) return;

    if (publicSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [publicSnap.currentRequest]);

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

      return zodResolver(publicCloudRequestDecisionBodySchema)(...args);
    },
    values: {
      decisionComment: '',
      decision: '',
      type: publicSnap.currentRequest?.type,
      ...publicSnap.currentRequest?.decisionData,
      accountCoding: publicSnap.currentRequest?.decisionData.billing.accountCoding,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const setComment = (decisionComment: string) => {
    const data = { ...methods.getValues(), decisionComment };
    makeDecision(data);
  };

  if (!publicSnap.currentRequest) {
    return null;
  }

  const isDisabled = true;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescriptionPublic,
      componentArgs: {
        disabled: isDisabled,
        mode: 'decision',
      },
    },
    {
      LeftIcon: IconLayoutGridAdd,
      label: 'Accounts to create',
      description: '',
      Component: AccountEnvironmentsPublic,
      componentArgs: { disabled: isDisabled, mode: 'decision' },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconUserDollar,
      label: 'Expense authority',
      description: '',
      Component: ExpenseAuthority,
      componentArgs: { disabled: isDisabled },
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: { disabled: isDisabled },
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (account Coding)',
      description: '',
      Component: AccountCoding,
      componentArgs: {
        accountCodingInitial: publicSnap.currentRequest.decisionData?.billing.accountCoding,
        disabled: true,
      },
    },
  ];

  if (publicSnap.currentRequest.requestComment) {
    const comment = publicSnap.currentRequest.requestComment;

    accordionItems.push({
      LeftIcon: IconMessage,
      label: 'User comments',
      description: '',
      Component: () => {
        return (
          <div className="">
            <p className="">{comment}</p>
          </div>
        );
      },
      componentArgs: {} as any,
    });
  }

  return (
    <div>
      <PublicCloudBillingInfo product={publicSnap.currentRequest.decisionData} className="mb-2" />
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(() => {
            if (methods.getValues('decision') === 'APPROVED') setOpenComment(true);
            if (methods.getValues('decision') === 'REJECTED') setOpenComment(true);
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {publicSnap.currentRequest._permissions.review && (
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
            {publicSnap.currentRequest._permissions.signMou && (
              <button
                onClick={async () => {
                  if (!publicSnap.currentRequest) return;
                  const res = await openSignPublicCloudProductModal<{ confirmed: boolean }>({
                    requestId: publicSnap.currentRequest.id,
                    name: publicSnap.currentRequest.decisionData.name,
                    provider: publicSnap.currentRequest.decisionData.provider,
                  });

                  if (res?.state.confirmed) {
                    router.push('/public-cloud/requests/all');
                  }
                }}
                type="button"
                className="flex rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign eMOU
              </button>
            )}
            {publicSnap.currentRequest._permissions.reviewMou && (
              <button
                onClick={async () => {
                  if (!publicSnap.currentRequest) return;
                  const res = await openReviewPublicCloudProductModal<{ confirmed: boolean }>({
                    requestId: publicSnap.currentRequest.id,
                    billingId: publicSnap.currentRequest.decisionData.billingId,
                  });

                  if (res?.state.confirmed) {
                    router.push('/public-cloud/requests/all');
                  }
                }}
                type="button"
                className="flex rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Review eMOU
              </button>
            )}
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
      <ReturnModal open={openReturn} setOpen={setOpenReturn} redirectUrl="/public-cloud/requests/all" />
    </div>
  );
});
