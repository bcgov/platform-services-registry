'use client';

import { PrivateCloudProject } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconComponents, IconMessage } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
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

  const [, privateSnap] = usePrivateProductState();
  const { id = '' } = pathParams ?? {};
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!privateSnap.currentRequest) return;

    if (privateSnap.currentRequest.originalData?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [privateSnap.currentRequest, router]);

  const methods = useForm({
    defaultValues: {
      decisionComment: '',
      decision: '',
      type: privateSnap.currentRequest?.type,
      ...privateSnap.currentRequest?.originalData,
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

  const isDisabled = true;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: privateSnap.currentRequest.type !== 'CREATE',
        mode: 'original',
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
        quotaContactRequired: false,
      },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
