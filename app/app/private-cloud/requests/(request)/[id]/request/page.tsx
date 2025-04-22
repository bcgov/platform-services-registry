'use client';

import {
  IconInfoCircle,
  IconUsersGroup,
  IconSettings,
  IconComponents,
  IconMessage,
  IconWebhook,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import CancelRequest from '@/components/buttons/CancelButton';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import AdditionalTeamMembers from '@/components/private-cloud/sections/AdditionalTeamMembers';
import Quotas from '@/components/private-cloud/sections/Quotas';
import TeamContacts from '@/components/private-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { DecisionStatus, PrivateCloudProduct, ProjectContext } from '@/prisma/types';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestRequest = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestRequest(({}) => {
  const [, snap] = usePrivateProductState();

  useEffect(() => {
    if (!snap.currentRequest) return;
  }, [snap.currentRequest]);

  const methods = useForm({
    defaultValues: {
      decisionComment: '',
      decision: '',
      type: snap.currentRequest?.type,
      ...snap.currentRequest?.requestData,
    },
  });

  if (!snap.currentRequest) {
    return null;
  }

  const isDisabled = true;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: snap.currentRequest.type !== 'CREATE',
        mode: 'request',
      },
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
      LeftIcon: IconSettings,
      label: 'Quotas (request)',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: snap.currentRequest?.licencePlate,
        cluster: snap.currentRequest?.originalData?.cluster,
        originalResourceRequests: snap.currentRequest?.originalData?.resourceRequests,
        quotaContactRequired: false,
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
        <form autoComplete="off">
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            {snap.currentRequest.decisionStatus === DecisionStatus.PENDING &&
              snap.currentRequest._permissions.cancel && (
                <CancelRequest id={snap.currentRequest.id} context={ProjectContext.PRIVATE} />
              )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
