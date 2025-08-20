'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconMessage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import CancelRequest from '@/components/buttons/CancelButton';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudRequestReviewModal } from '@/components/modal/privateCloudRequestReview';
import Quotas from '@/components/private-cloud/sections/Quotas';
import TeamContacts from '@/components/private-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { DecisionStatus, ProjectContext, RequestType } from '@/prisma/client';
import { usePrivateProductState } from '@/states/global';
import { RequestDecision } from '@/validation-schemas';
import {
  privateCloudRequestDecisionBodySchema,
  PrivateCloudRequestDecisionBody,
} from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestDecision = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestDecision(({ getPathParams, session, router }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [, snap] = usePrivateProductState();
  const { id = '' } = pathParams ?? {};

  useEffect(() => {
    if (!snap.currentRequest) return;

    if (id && !snap.currentRequest._permissions.viewDecision) {
      router.push(`/private-cloud/requests/${id}/summary`);
      return;
    }
  }, [snap.currentRequest, router]);
  const methods = useForm<PrivateCloudRequestDecisionBody>({
    resolver: (values, context, options) => {
      const isDeleteRequest = values.type === RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values,
          errors: {},
        };
      }

      return zodResolver(privateCloudRequestDecisionBodySchema)(values, context, options);
    },
    defaultValues: {
      decisionComment: '',
      decision: RequestDecision.APPROVED as RequestDecision,
      type: snap.currentRequest?.type,
      ...snap.currentRequest?.decisionData,
    },
  });

  if (!snap.currentRequest) {
    return null;
  }

  const isDisabled = !snap.currentRequest._permissions.review;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: snap.currentRequest.type !== 'CREATE',
        mode: 'decision',
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team members',
      description: '',
      Component: TeamContacts,
      componentArgs: {
        isTeamContactsDisabled: isDisabled,
        isAdditionalMembersDisabled: true,
      },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas (request)',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: snap.currentRequest?.licencePlate,
        cluster: snap.currentRequest?.originalData?.cluster,
        isGoldDR: snap.currentRequest?.originalData?.golddrEnabled ?? false,
        originalResourceRequests: snap.currentRequest?.originalData?.resourceRequests,
        quotaContactRequired: true,
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
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(async (formData) => {
            if (!snap.currentRequest) return;

            const decision = formData.decision as RequestDecision;
            await openPrivateCloudRequestReviewModal(
              {
                request: snap.currentRequest,
                finalData: formData as PrivateCloudRequestDecisionBody,
              },
              { settings: { title: `${decision === RequestDecision.APPROVED ? 'Approve' : 'Reject'} Request` } },
            );
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            {snap.currentRequest.decisionStatus === DecisionStatus.PENDING &&
              snap.currentRequest._permissions.cancel && (
                <CancelRequest id={snap.currentRequest.id} context={ProjectContext.PRIVATE} />
              )}
            {snap.currentRequest._permissions.review && (
              <>
                <Button
                  type="submit"
                  color="danger"
                  onClick={() => {
                    methods.setValue('decision', RequestDecision.REJECTED as never);
                  }}
                >
                  Reject
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  onClick={() => {
                    methods.setValue('decision', RequestDecision.APPROVED as never);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
