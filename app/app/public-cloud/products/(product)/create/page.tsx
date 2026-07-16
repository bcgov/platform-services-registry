'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { IconInfoCircle, IconUsersGroup, IconLayoutGridAdd, IconMoneybag, IconChartBar } from '@tabler/icons-react';
import { FormProvider, useForm } from 'react-hook-form';
import PreviousButton from '@/components/buttons/Previous';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudProductCreateSubmitModal } from '@/components/modal/publicCloudProductCreateSubmit';
import {
  budgetAmountToForecastCad,
  buildRollingFiscalForecastMonths,
  getProviderBudgetCurrency,
  sumEnabledEnvironmentBudgets,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import PublicCloudCreateForecastSection from '@/components/public-cloud/sections/PublicCloudCreateForecastSection';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getUsdCadExchangeRate } from '@/services/backend/public-cloud/forecast';
import { publicCloudCreateRequestBodySchema } from '@/validation-schemas/public-cloud';

const publicCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});
export default publicCloudProductNew(({ session }) => {
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
    ...(session?.previews.publicCloudForecast
      ? [
          {
            LeftIcon: IconChartBar,
            label: 'Spend forecast',
            description: '',
            Component: PublicCloudCreateForecastSection,
            componentArgs: {},
          },
        ]
      : []),
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
            // If the spend forecast accordion was never opened, still seed from budget (CAD).
            if (
              session?.previews.publicCloudForecast &&
              (!formData.forecastMonthlyValues || formData.forecastMonthlyValues.length === 0)
            ) {
              const budgetTotal = sumEnabledEnvironmentBudgets(formData.budget, formData.environmentsEnabled);
              const budgetCurrency = getProviderBudgetCurrency(formData.provider);
              let totalCad = Math.round(budgetTotal);
              if (budgetCurrency === 'USD') {
                const { rate } = await getUsdCadExchangeRate();
                totalCad = budgetAmountToForecastCad(budgetTotal, 'USD', rate);
              }
              formData.forecastMonthlyValues = buildRollingFiscalForecastMonths(totalCad, 'CAD', new Date());
            }

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
