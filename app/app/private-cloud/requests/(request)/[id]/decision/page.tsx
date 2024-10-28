'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PrivateCloudProject, RequestType } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconComponents, IconMessage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudRequestReviewModal } from '@/components/modal/privateCloudRequestReviewModal';
import { GlobalRole } from '@/constants';
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

  const [privateState, privateSnap] = usePrivateProductState();
  const { id = '' } = pathParams ?? {};
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!privateSnap.currentRequest) return;

    if (id && !privateSnap.currentRequest._permissions.viewDecision) {
      router.push(`/private-cloud/requests/${id}/summary`);
      return;
    }

    if (privateSnap.currentRequest.decisionData.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [privateSnap.currentRequest, router]);

  const methods = useForm({
    resolver: (...args) => {
      const isDeleteRequest = privateSnap.currentRequest?.type === RequestType.DELETE;

      // Ignore form validation if a DELETE request
      if (isDeleteRequest) {
        return {
          values: {},
          errors: {},
        };
      }

      return zodResolver(privateCloudRequestDecisionBodySchema)(...args);
    },
    defaultValues: {
      decisionComment: '',
      decision: RequestDecision.APPROVED as RequestDecision,
      type: privateSnap.currentRequest?.type,
      ...privateSnap.currentRequest?.decisionData,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  if (!privateSnap.currentRequest) {
    return null;
  }

  const isDisabled = !privateSnap.currentRequest._permissions.edit;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: privateSnap.currentRequest.type !== 'CREATE',
        mode: 'decision',
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: privateSnap.currentRequest.licencePlate as string,
        currentProject: privateSnap.currentRequest.project as PrivateCloudProject,
      },
    },
  ];

  if (privateSnap.currentRequest.requestComment) {
    const comment = privateSnap.currentRequest.requestComment;

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
            if (!privateSnap.currentRequest) return;

            const decision = formData.decision as RequestDecision;
            await openPrivateCloudRequestReviewModal(
              {
                request: privateSnap.currentRequest,
                finalData: formData as PrivateCloudRequestDecisionBody,
              },
              { settings: { title: `${decision === RequestDecision.APPROVED ? 'Approve' : 'Reject'} Request` } },
            );
          })}
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {privateSnap.currentRequest._permissions.review && (
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
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
