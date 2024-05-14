'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import AccountCoding from '@/components/form/AccountCoding';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const publicCloudRequestRequest = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudRequestRequest(({ pathParams, queryParams, session, router }) => {
  const [publicState, publicSnap] = usePublicProductState();
  const { id } = pathParams;
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!publicSnap.currentRequest) return;

    if (publicSnap.currentRequest.requestData?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [publicSnap.currentRequest, router]);

  const methods = useForm({
    values: {
      decisionComment: '',
      decision: '',
      type: publicSnap.currentRequest?.type,
      ...publicSnap.currentRequest?.requestData,
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
            <ProjectDescription disabled={isDisabled} mode="decision" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <ExpenseAuthority disabled={isDisabled} />
            <Budget disabled={isDisabled} />
            <AccountCoding
              accountCodingInitial={publicSnap.currentRequest.requestData?.accountCoding}
              disabled={false}
            />
          </div>

          {publicSnap.currentRequest.requestComment && (
            <div className="border-b border-gray-900/10 pb-14">
              <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                4. User Comments
              </h2>
              <p className="mt-4 text-base leading-6 text-gray-600">{publicSnap.currentRequest.requestComment}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
