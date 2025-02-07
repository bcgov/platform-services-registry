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
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PreviousButton from '@/components/buttons/Previous';
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudProductCreateSubmitModal } from '@/components/modal/publicCloudProductCreateSubmit';
import { GlobalRole, userAttributes } from '@/constants';
import createClientPage from '@/core/client-page';
import { existBilling } from '@/services/backend/billing';
import { publicCloudCreateRequestBodySchema } from '@/validation-schemas/public-cloud';

const publicCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});
export default publicCloudProductNew(({}) => {
  const [secondTechLead, setSecondTechLead] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      publicCloudCreateRequestBodySchema.refine(
        async (formData) => {
          const hasBilling = await existBilling(formData.accountCoding, formData.provider);
          if (!hasBilling) return true;
          return formData.isEaApproval;
        },
        {
          message: 'EA Approval Checkbox should be checked.',
          path: ['isEaApproval'],
        },
      ),
    ),
    defaultValues: {
      environmentsEnabled: {
        production: true,
      },
      budget: {
        dev: 50,
        test: 50,
        prod: 50,
        tools: 50,
      },
    } as any,
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

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
      componentArgs: { hasEA: true, userAttributes, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: {},
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (account coding)',
      description: '',
      Component: AccountCoding,
      componentArgs: {},
    },
  ];

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        New Public Cloud Product
      </h1>
      <h3 className="mt-0 mb-3 italic">Public Cloud Landing Zone</h3>

      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(async (formData) => {
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
