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
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { publicCloudCreateRequestBodySchema } from '@/validation-schemas/public-cloud';

const publicCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});
export default publicCloudProductNew(({}) => {
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
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: {},
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: {},
    },
  ];

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        New Public Cloud Product
      </h1>
      <h3 className="mt-0 mb-3 italic">Public Cloud Landing Zone</h3>

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
