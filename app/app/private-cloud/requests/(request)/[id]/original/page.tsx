'use client';

import { PrivateCloudProject } from '@prisma/client';
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
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import AdditionalTeamMembers from '@/components/private-cloud/sections/AdditionalTeamMembers';
import ModifiedTeamContacts from '@/components/private-cloud/sections/ModifiedTeamContacts';
import Quotas from '@/components/private-cloud/sections/Quotas';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestOriginal = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestOriginal(({ getPathParams, session, router }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [, snap] = usePrivateProductState();
  const { id = '' } = pathParams ?? {};
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!snap.currentRequest) return;

    if (snap.currentRequest.originalData?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [snap.currentRequest, router]);

  const methods = useForm({
    defaultValues: {
      decisionComment: '',
      decision: '',
      type: snap.currentRequest?.type,
      ...snap.currentRequest?.originalData,
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

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: snap.currentRequest.type !== 'CREATE',
        mode: 'original',
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: ModifiedTeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
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

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
