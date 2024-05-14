'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { $Enums, PrivateCloudProject } from '@prisma/client';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import createClientPage from '@/core/client-page';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  id: z.string(),
});

const privateCloudRequestOriginal = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudRequestOriginal(({ pathParams, queryParams, session, router }) => {
  const [privateState, privateSnap] = usePrivateProductState();
  const { id } = pathParams;
  const [secondTechLead, setSecondTechLead] = useState(false);

  useEffect(() => {
    if (!privateSnap.currentRequest) return;

    if (privateSnap.currentRequest.originalData?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [privateSnap.currentRequest, router]);

  const methods = useForm({
    values: {
      decisionComment: '',
      decision: '',
      type: privateSnap.currentRequest?.type,
      ...privateSnap.currentRequest?.originalData,
    },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  if (!privateSnap.currentRequest) {
    return null;
  }

  const isDisabled = true;

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off">
          <div className="mb-12 mt-8">
            <ProjectDescription
              disabled={isDisabled}
              clusterDisabled={privateSnap.currentRequest.type !== 'CREATE'}
              mode="decision"
            />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licencePlate={privateSnap.currentRequest.licencePlate as string}
              disabled={isDisabled}
              currentProject={privateSnap.currentRequest.project as PrivateCloudProject}
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
