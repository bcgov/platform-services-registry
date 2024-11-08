'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CPU, Memory, Storage, PrivateCloudProject } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconComponents } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import CommonComponents from '@/components/form/CommonComponents';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudProductEditSubmitModal } from '@/components/modal/privateCloudProductEditSubmit';
import { AGMinistries, GlobalRole, defaultQuota } from '@/constants';
import createClientPage from '@/core/client-page';
import { getQuotaChangeStatus } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { privateCloudEditRequestBodySchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductEdit = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductEdit(({ session }) => {
  const [, snap] = usePrivateProductState();
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const methods = useForm({
    resolver: async (...args) => {
      const { developmentQuota, testQuota, productionQuota, toolsQuota } = args[0];

      const quotaChangeStatus = await getQuotaChangeStatus(snap.licencePlate, {
        developmentQuota,
        testQuota,
        productionQuota,
        toolsQuota,
      });

      return zodResolver(
        privateCloudEditRequestBodySchema
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaContactName;
            },
            {
              message: 'Contact name should be provided.',
              path: ['quotaContactName'],
            },
          )
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaContactEmail;
            },
            {
              message: 'Contact email should be provided.',
              path: ['quotaContactEmail'],
            },
          )
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaJustification;
            },
            {
              message: 'Quota justification should be provided.',
              path: ['quotaJustification'],
            },
          )
          .transform((formData) => {
            if (quotaChangeStatus.isEligibleForAutoApproval) {
              formData.quotaContactName = '';
              formData.quotaContactEmail = '';
              formData.quotaJustification = '';
            }

            return formData;
          }),
      )(...args);
    },
    defaultValues: {
      developmentQuota: defaultQuota,
      testQuota: defaultQuota,
      productionQuota: defaultQuota,
      toolsQuota: defaultQuota,
      ...snap.currentProduct,
      isAgMinistryChecked: true,
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (!snap.currentProduct) return;

    if (snap.currentProduct.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }

    setDisabled(!snap.currentProduct?._permissions.edit);
  }, [snap.currentProduct]);

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
      setIsSecondaryTechLeadRemoved(true);
    }
  };

  const isSubmitEnabled = Object.keys(formState.dirtyFields).length > 0 || isSecondaryTechLeadRemoved;

  if (!snap.currentProduct) {
    return null;
  }

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: true,
        mode: 'edit',
        canToggleTemporary: snap.currentProduct._permissions.toggleTemporary,
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: snap.currentProduct?.licencePlate as string,
        currentProject: snap.currentProduct as PrivateCloudProject,
        quotaContactRequired: true,
      },
    },
    {
      LeftIcon: IconComponents,
      label: 'Common components',
      description: '',
      Component: CommonComponents,
      componentArgs: { disabled: isDisabled },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPrivateCloudProductEditSubmitModal({ productData: formData });
          })}
          autoComplete="off"
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {!isDisabled ? (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton text="Submit" disabled={!isSubmitEnabled} />
              </div>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
