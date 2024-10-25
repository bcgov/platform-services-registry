'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { RequestType } from '@prisma/client';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconMessage,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
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
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openReviewPublicCloudProductModal } from '@/components/modal/reviewPublicCloudProductModal';
import { openSignPublicCloudProductModal } from '@/components/modal/signPublicCloudProductModal';
import { openPublicCloudRequestReviewModal } from '@/components/modals/publicCloudRequestReviewModal';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';
import {
  publicCloudRequestDecisionBodySchema,
  PublicCloudRequestDecisionBody,
} from '@/validation-schemas/public-cloud';
import { RequestDecision } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudProductRequest = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductRequest(({ router }) => {
  const [publicState, publicSnap] = usePublicProductState();
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!publicSnap.currentRequest) return;

    if (publicSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [publicSnap.currentRequest]);

  const methods = useForm({
    resolver: (...args) => {
      const isDeleteRequest = publicSnap.currentRequest?.type === RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values: {},
          errors: {},
        };
      }

      return zodResolver(publicCloudRequestDecisionBodySchema)(...args);
    },
    defaultValues: {
      decisionComment: '',
      decision: RequestDecision.APPROVED as RequestDecision,
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

  if (!publicSnap.currentRequest) {
    return null;
  }

  const isDisabled = true;
  const canSignEmou = publicSnap.currentRequest._permissions.signMou;

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
      initialOpen: true,
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
      initialOpen: true,
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (account coding)',
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
          onSubmit={methods.handleSubmit(async (formData) => {
            if (!formData || !publicSnap.currentRequest) return;

            const decision = formData.decision as RequestDecision;
            await openPublicCloudRequestReviewModal(
              {
                request: publicSnap.currentRequest,
                finalData: formData as PublicCloudRequestDecisionBody,
              },
              { settings: { title: `${decision === RequestDecision.APPROVED ? 'Approve' : 'Reject'} Request` } },
            );
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
                    methods.setValue('decision', RequestDecision.REJECTED);
                  }}
                />
                <SubmitButton
                  text="APPROVE REQUEST"
                  onClick={() => {
                    methods.setValue('decision', RequestDecision.APPROVED);
                  }}
                />
              </div>
            )}
            {canSignEmou && (
              <button
                onClick={async () => {
                  if (!publicSnap.currentRequest) return;
                  const res = await openSignPublicCloudProductModal<{ confirmed: boolean }>({
                    licencePlate: publicSnap.currentRequest.licencePlate,
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
                    licencePlate: publicSnap.currentRequest.licencePlate,
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
    </div>
  );
});
