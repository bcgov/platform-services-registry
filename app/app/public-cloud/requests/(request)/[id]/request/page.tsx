'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button } from '@mantine/core';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconMessage,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import CancelRequest from '@/components/buttons/CancelButton';
import PreviousButton from '@/components/buttons/Previous';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudMouReviewModal } from '@/components/modal/publicCloudMouReview';
import { openPublicCloudMouSignModal } from '@/components/modal/publicCloudMouSign';
import { openPublicCloudRequestReviewModal } from '@/components/modal/publicCloudRequestReview';
import BillingStatusProgress from '@/components/public-cloud/BillingStatusProgress';
import AdditionalTeamMembers from '@/components/public-cloud/sections/AdditionalTeamMembers';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { DecisionStatus, ProjectContext, RequestType, TaskStatus, TaskType } from '@/prisma/client';
import { searchPublicCloudBillings } from '@/services/backend/public-cloud/billings';
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
  const [, publicProductSnap] = usePublicProductState();

  useEffect(() => {
    if (!publicProductSnap.currentRequest) return;
  }, [publicProductSnap.currentRequest]);

  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billings', publicProductSnap?.currentRequest?.id],
    queryFn: () =>
      searchPublicCloudBillings({
        licencePlate: publicProductSnap?.currentRequest?.licencePlate ?? '',
        page: 1,
        pageSize: 1,
        includeMetadata: false,
      }),
    refetchInterval: 1000,
    enabled: publicProductSnap?.currentRequest?.type === RequestType.CREATE,
  });

  const form = useForm<PublicCloudRequestDecisionBody>({
    resolver: (values, context, options) => {
      const isDeleteRequest = values.type === RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values,
          errors: {},
        };
      }

      return zodResolver(publicCloudRequestDecisionBodySchema)(values, context, options);
    },
    defaultValues: {
      requestComment: '',
      decisionComment: '',
      decision: RequestDecision.APPROVED,
      type: publicProductSnap.currentRequest?.type,
      ...publicProductSnap.currentRequest?.decisionData,
      expenseAuthorityId: publicProductSnap.currentRequest?.decisionData?.expenseAuthorityId ?? '',
    },
  });

  if (!publicProductSnap.currentRequest) {
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
      label: 'Team members',
      description: '',
      Component: TeamContacts,
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
  ];

  if (publicProductSnap.currentRequest.requestComment) {
    const comment = publicProductSnap.currentRequest.requestComment;

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
      {billingData && billingData.data.length > 0 && (
        <Alert variant="light" color="blue" title="Billing eMOU status" icon={<IconInfoCircle />} className="mb-2">
          <BillingStatusProgress
            billing={billingData.data[0]}
            data={{
              name: publicProductSnap.currentRequest.decisionData.name,
              provider: publicProductSnap.currentRequest.decisionData.provider,
            }}
            editable
            className="max-w-4xl"
          />
        </Alert>
      )}

      <FormProvider {...form}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(async (formData) => {
            if (!formData || !publicProductSnap.currentRequest) return;

            const decision = formData.decision as RequestDecision;
            await openPublicCloudRequestReviewModal(
              {
                request: publicProductSnap.currentRequest,
                finalData: formData,
              },
              { settings: { title: `${decision === RequestDecision.APPROVED ? 'Approve' : 'Reject'} Request` } },
            );
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            {publicProductSnap.currentRequest.decisionStatus === DecisionStatus.PENDING &&
              publicProductSnap.currentRequest._permissions.cancel && (
                <CancelRequest id={publicProductSnap.currentRequest.id} context={ProjectContext.PUBLIC} />
              )}
            {publicProductSnap.currentRequest._permissions.review && (
              <>
                <Button
                  type="submit"
                  color="danger"
                  onClick={() => {
                    form.setValue('decision', RequestDecision.REJECTED);
                  }}
                >
                  Reject
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  onClick={() => {
                    form.setValue('decision', RequestDecision.APPROVED);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
            {publicProductSnap.currentRequest._permissions.signMou && (
              <Button
                color="info"
                onClick={async () => {
                  if (!publicProductSnap.currentRequest || !billingData) return;

                  const currentBilling = billingData.data[0];
                  const res = await openPublicCloudMouSignModal({
                    billingId: currentBilling.id,
                    licencePlate: currentBilling.licencePlate,
                    accountCoding: currentBilling.accountCoding,
                    name: publicProductSnap.currentRequest.decisionData.name,
                    provider: publicProductSnap.currentRequest.decisionData.provider,
                    editable: true,
                  });

                  if (res.state.confirmed) {
                    router.push('/public-cloud/requests/all');
                  }
                }}
              >
                Sign eMOU
              </Button>
            )}
            {publicProductSnap.currentRequest._permissions.reviewMou && (
              <Button
                color="info"
                onClick={async () => {
                  if (!publicProductSnap.currentRequest || !billingData) return;

                  const currentBilling = billingData.data[0];
                  const res = await openPublicCloudMouReviewModal({
                    billingId: currentBilling.id,
                    licencePlate: currentBilling.licencePlate,
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
