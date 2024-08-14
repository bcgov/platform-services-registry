'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestOriginal = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestOriginal(({ pathParams, queryParams, session, router }) => {
  const [publicState, publicSnap] = usePublicProductState();
  const { id } = pathParams;
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!publicSnap.currentRequest) return;

    if (publicSnap.currentRequest.originalData?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [publicSnap.currentRequest, router]);

  const methods = useForm({
    values: {
      decisionComment: '',
      decision: '',
      type: publicSnap.currentRequest?.type,
      ...publicSnap.currentRequest?.originalData,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  if (!publicSnap.currentRequest) {
    return null;
  }

  const isDisabled = true;

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <div className="mb-12">
            <ProjectDescriptionPublic disabled={isDisabled} mode="view" />
            <hr className="my-7" />
            <AccountEnvironmentsPublic disabled={isDisabled} mode="view" />
            <hr className="my-7" />
            <TeamContacts
              disabled={isDisabled}
              number={3}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <hr className="my-7" />
            <ExpenseAuthority disabled={isDisabled} />
            <hr className="my-7" />
            <Budget disabled={isDisabled} />
            <hr className="my-7" />
            <AccountCoding
              accountCodingInitial={publicSnap.currentRequest.originalData?.accountCoding}
              disabled={isDisabled}
            />
          </div>

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
