'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconWebhook } from '@tabler/icons-react';
import { FormProvider, useForm } from 'react-hook-form';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudProductCreateSubmitModal } from '@/components/modal/privateCloudProductCreateSubmit';
import Quotas from '@/components/private-cloud/sections/Quotas';
import TeamContacts from '@/components/private-cloud/sections/TeamContacts';
import Webhooks from '@/components/private-cloud/sections/Webhooks';
import { GlobalRole, defaultResourceRequests } from '@/constants';
import createClientPage from '@/core/client-page';
import { privateCloudCreateRequestBodySchema } from '@/validation-schemas/private-cloud';

const privateCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});

export default privateCloudProductNew(({ session }) => {
  const methods = useForm({
    resolver: zodResolver(privateCloudCreateRequestBodySchema),
    defaultValues: {
      resourceRequests: {
        development: defaultResourceRequests,
        test: defaultResourceRequests,
        production: defaultResourceRequests,
        tools: defaultResourceRequests,
      },
    },
  });

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: { mode: 'create' },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team members',
      description: '',
      Component: TeamContacts,
      componentArgs: {
        showAdditionalTeamMembers: false,
      },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas (request)',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: true,
      },
    },
    {
      LeftIcon: IconWebhook,
      label: 'Webhooks',
      description: '',
      Component: Webhooks,
      componentArgs: {},
    },
  ];

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        New Private Cloud Product
      </h1>
      <h3 className="mt-0 mb-3 italic">Private Cloud OpenShift platform</h3>

      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPrivateCloudProductCreateSubmitModal({ productData: formData });
          })}
          autoComplete="off"
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            <Button type="submit" color="primary">
              Submit
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
