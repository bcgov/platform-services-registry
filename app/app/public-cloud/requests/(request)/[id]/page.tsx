'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconSettings,
  IconComponents,
  IconMessage,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import AccountCoding from '@/components/form/AccountCoding';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';
import { publicCloudRequestDecisionBodySchema } from '@/validation-schemas/public-cloud';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequest = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequest(({ pathParams }) => {
  const { id } = pathParams;

  const { data: request, isLoading: isRequestLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getPublicCloudRequest(id),
    enabled: !!id,
  });

  const methods = useForm({
    resolver: zodResolver(publicCloudRequestDecisionBodySchema),
    defaultValues: { comment: '', decision: '', ...request },
  });

  if (!request) return null;

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescriptionPublic,
      componentArgs: {
        disabled: true,
        mode: 'decision',
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: {
        disabled: true,
        secondTechLead: !!request.decisionData.secondaryTechnicalLeadId,
        secondTechLeadOnClick: () => {},
      },
    },
    {
      LeftIcon: IconUserDollar,
      label: 'Expense authority',
      description: '',
      Component: ExpenseAuthority,
      componentArgs: { disabled: true },
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: { disabled: true },
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (account coding)',
      description: '',
      Component: AccountCoding,
      componentArgs: { accountCodingInitial: request.decisionData.billing.accountCoding, disabled: true },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <PageAccordion items={accordionItems} />
        </form>
      </FormProvider>
    </div>
  );
});
