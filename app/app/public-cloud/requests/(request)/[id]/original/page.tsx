'use client';

import { IconInfoCircle, IconUsersGroup, IconLayoutGridAdd, IconMoneybag, IconCode } from '@tabler/icons-react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import Repositories from '@/components/form/Repositories';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestOriginal = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestOriginal(({ router }) => {
  const [, snap] = usePublicProductState();

  useEffect(() => {
    if (!snap.currentRequest) return;
  }, [snap.currentRequest, router]);

  const methods = useForm({
    defaultValues: {
      decisionComment: '',
      decision: '',
      type: snap.currentRequest?.type,
      repositories: snap.currentRequest?.requestData?.repositories ?? [],
      ...snap.currentRequest?.originalData,
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
      Component: ProjectDescriptionPublic,
      componentArgs: {
        disabled: isDisabled,
        mode: 'view',
      },
    },
    {
      LeftIcon: IconLayoutGridAdd,
      label: 'Accounts to create',
      description: '',
      Component: AccountEnvironmentsPublic,
      componentArgs: { disabled: isDisabled, mode: 'view' },
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
      LeftIcon: IconCode,
      label: 'Repositories',
      description: '',
      Component: Repositories,
      componentArgs: {
        disabled: isDisabled,
      },
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: { disabled: isDisabled },
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
