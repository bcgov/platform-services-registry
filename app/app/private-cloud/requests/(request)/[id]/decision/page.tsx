'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { DecisionStatus, ProjectContext, RequestType } from '@prisma/client';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconSettings,
  IconComponents,
  IconMessage,
  IconWebhook,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import CancelRequest from '@/components/buttons/CancelButton';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudRequestReviewModal } from '@/components/modal/privateCloudRequestReview';
import AdditionalTeamMembers from '@/components/private-cloud/sections/AdditionalTeamMembers';
import Quotas from '@/components/private-cloud/sections/Quotas';
import { GlobalRole, userAttributes } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';
import {
  privateCloudRequestDecisionBodySchema,
  PrivateCloudRequestDecisionBody,
} from '@/validation-schemas/private-cloud';
import { RequestDecision } from '@/validation-schemas/shared';

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
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!snap.currentRequest) return;

    if (id && !snap.currentRequest._permissions.viewDecision) {
      router.push(`/private-cloud/requests/${id}/summary`);
      return;
    }

    if (snap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [snap.currentRequest, router]);
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

      return zodResolver(privateCloudRequestDecisionBodySchema)(...args);
    },
    defaultValues: {
      decisionComment: '',
      decision: RequestDecision.APPROVED as RequestDecision,
      type: snap.currentRequest?.type,
      ...snap.currentRequest?.decisionData,
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

  let isDisabled = !snap.currentRequest._permissions.edit;

  if (snap.currentRequest._permissions.cancel) {
    isDisabled = true;
  }

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
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { userAttributes, disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Additional team members',
      description: '',
      Component: AdditionalTeamMembers,
      componentArgs: { disabled: true },
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
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
