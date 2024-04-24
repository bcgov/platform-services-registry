'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import { useQuery } from '@tanstack/react-query';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import { z } from 'zod';
import { getPublicCloudRequestedProject } from '@/services/backend/public-cloud';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import createClientPage from '@/core/client-page';

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
    queryFn: () => getPublicCloudRequestedProject(id),
    enabled: !!id,
  });

  const methods = useForm({
    resolver: zodResolver(PublicCloudDecisionRequestBodySchema),
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
              secondTechLead={request.secondaryTechnicalLeadId}
              secondTechLeadOnClick={() => {}}
            />
            <ExpenseAuthority disabled={true} />
            <Budget disabled={true} />
            <AccountCoding accountCodingInitial={request.accountCoding} disabled={true} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
