'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
import { FormProvider, useForm } from 'react-hook-form';
import PreviousButton from '@/components/buttons/Previous';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudProductCreateSubmitModal } from '@/components/modal/publicCloudProductCreateSubmit';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { publicCloudCreateRequestBodySchema } from '@/validation-schemas/public-cloud';

const publicCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});
export default publicCloudProductNew(() => {
  const form = useForm({
    resolver: zodResolver(publicCloudCreateRequestBodySchema),
    defaultValues: {
      environmentsEnabled: {
        production: true,
      },
      budget: {
        dev: 0,
        test: 0,
        prod: 0,
        tools: 0,
      },
    } as any,
  });

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescriptionPublic,
      componentArgs: {
        mode: 'create',
      },
    },
    {
      LeftIcon: IconLayoutGridAdd,
      label: 'Accounts to create',
      description: '',
      Component: AccountEnvironmentsPublic,
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
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: {
        mode: 'create',
      },
    },
  ];

  return (
    <div>
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Resources', href: '/resources' },
          { label: 'Public Cloud Landing Zone', href: '/resources/public-cloud-landing-zone' },
          { label: 'New Product' },
        ]}
        title="New Public Cloud Product"
        description="Create a new product request for the Public Cloud Landing Zone."
      />

      <FormProvider {...form}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(async (formData) => {
            await openPublicCloudProductCreateSubmitModal({ productData: formData });
          })}
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
