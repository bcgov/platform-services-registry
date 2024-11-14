'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
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
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudMouReviewModal } from '@/components/modal/publicCloudMouReview';
import { openPublicCloudMouSignModal } from '@/components/modal/publicCloudMouSign';
import { openPublicCloudRequestReviewModal } from '@/components/modal/publicCloudRequestReview';
import AdditionalTeamMembers from '@/components/public-cloud/sections/AdditionalTeamMembers';
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
  const [, snap] = usePublicProductState();
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!snap.currentRequest) return;

    if (snap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [snap.currentRequest]);

  const methods = useForm({
    resolver: (...args) => {
      const [values] = args;
      const isDeleteRequest = values.type === RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values,
          errors: {},
        };
      }

      return zodResolver(publicCloudRequestDecisionBodySchema)(...args);
    },
    defaultValues: {
      decisionComment: '',
      decision: RequestDecision.APPROVED as RequestDecision,
      type: snap.currentRequest?.type,
      ...snap.currentRequest?.decisionData,
      accountCoding: snap.currentRequest?.decisionData.billing.accountCoding,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  if (!snap.currentRequest) {
    return null;
  }

  const isDisabled = true;
  const canSignEmou = snap.currentRequest._permissions.signMou;

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
      LeftIcon: IconUsersGroup,
      label: 'Additional team members',
      description: '',
      Component: AdditionalTeamMembers,
      componentArgs: { disabled: true },
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
        accountCodingInitial: snap.currentRequest.decisionData?.billing.accountCoding,
        disabled: true,
      },
    },
  ];

  if (snap.currentRequest.requestComment) {
    const comment = snap.currentRequest.requestComment;

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
      <PublicCloudBillingInfo product={snap.currentRequest.decisionData} className="mb-2" />
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (!formData || !snap.currentRequest) return;

            const decision = formData.decision as RequestDecision;
            await openPublicCloudRequestReviewModal(
              {
                request: snap.currentRequest,
                finalData: formData as PublicCloudRequestDecisionBody,
              },
              { settings: { title: `${decision === RequestDecision.APPROVED ? 'Approve' : 'Reject'} Request` } },
            );
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            {snap.currentRequest._permissions.review && (
              <>
                <Button
                  type="submit"
                  color="danger"
                  onClick={() => {
                    methods.setValue('decision', RequestDecision.REJECTED);
                  }}
                >
                  Reject
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  onClick={() => {
                    methods.setValue('decision', RequestDecision.APPROVED);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
            {canSignEmou && (
              <Button
                color="info"
                onClick={async () => {
                  if (!snap.currentRequest) return;
                  const res = await openPublicCloudMouSignModal<{ confirmed: boolean }>({
                    licencePlate: snap.currentRequest.licencePlate,
                    name: snap.currentRequest.decisionData.name,
                    provider: snap.currentRequest.decisionData.provider,
                  });

                  if (res.state.confirmed) {
                    router.push('/public-cloud/requests/all');
                  }
                }}
              >
                Sign eMOU
              </Button>
            )}
            {snap.currentRequest._permissions.reviewMou && (
              <Button
                color="info"
                onClick={async () => {
                  if (!snap.currentRequest) return;
                  const res = await openPublicCloudMouReviewModal<{ confirmed: boolean }>({
                    licencePlate: snap.currentRequest.licencePlate,
                    billingId: snap.currentRequest.decisionData.billingId,
                  });

                  if (res.state.confirmed) {
                    router.push('/public-cloud/requests/all');
                  }
                }}
              >
                Review eMOU
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
