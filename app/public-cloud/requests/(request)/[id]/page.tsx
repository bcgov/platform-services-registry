'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import AccountCoding from '@/components/form/AccountCoding';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import createClientPage from '@/core/client-page';
import { PublicCloudRequestDecisionBodySchema } from '@/schema';
import { getPublicCloudRequest } from '@/services/backend/public-cloud/requests';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequest = createClientPage({
  roles: ['user'],
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
    resolver: zodResolver(PublicCloudRequestDecisionBodySchema),
    values: { comment: '', decision: '', ...request },
  });

  if (!request) return null;

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <div className="mb-12">
            <ProjectDescription disabled={true} mode="decision" />
            <TeamContacts
              disabled={true}
              secondTechLead={!!request.decisionData.secondaryTechnicalLeadId}
              secondTechLeadOnClick={() => {}}
            />
            <ExpenseAuthority disabled={true} />
            <Budget disabled={true} />
            <AccountCoding accountCodingInitial={request.decisionData.accountCoding} disabled={true} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
