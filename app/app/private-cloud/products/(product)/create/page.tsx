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
import EntityPageHeader from '@/components/system/EntityPageHeader';
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
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Resources', href: '/resources' },
          { label: 'Private Cloud OpenShift', href: '/resources/private-cloud-openshift' },
          { label: 'New Product' },
        ]}
        title="New Private Cloud Product"
        description="Create a new product request for the Private Cloud OpenShift platform."
      />

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
