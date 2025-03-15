'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { ResourceRequestsEnv } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudProductEditSubmitModal } from '@/components/modal/privateCloudProductEditSubmit';
import AdditionalTeamMembers from '@/components/private-cloud/sections/AdditionalTeamMembers';
import Quotas from '@/components/private-cloud/sections/Quotas';
import TeamContacts from '@/components/private-cloud/sections/TeamContacts';
import SiloAccordion from '@/components/private-cloud/SiloAccordion';
import { GlobalRole } from '@/constants';
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

  const methods = useForm({
    resolver: async (...args) => {
      const { resourceRequests } = args[0];

      const quotaChangeStatus = await getQuotaChangeStatus(snap.licencePlate, resourceRequests as ResourceRequestsEnv);

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
      ...snap.currentProduct,
      isAgMinistryChecked: true,
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (!snap.currentProduct) return;

    setDisabled(!snap.currentProduct?._permissions.edit);
  }, [snap.currentProduct]);

  const isSubmitEnabled = Object.keys(formState.dirtyFields).length > 0;

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
      label: 'Team members',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Additional team members',
      description: '',
      Component: AdditionalTeamMembers,
      componentArgs: { disabled: isDisabled || !snap.currentProduct._permissions.manageMembers },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas (request)',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: snap.currentProduct?.licencePlate,
        cluster: snap.currentProduct?.cluster,
        originalResourceRequests: snap.currentProduct?.resourceRequests,
        quotaContactRequired: true,
      },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPrivateCloudProductEditSubmitModal({
              productData: formData,
              originalProductData: methods.getValues(),
            });
          })}
          autoComplete="off"
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-2">
            <PreviousButton />
            {!isDisabled && (
              <Button type="submit" color="primary" disabled={!isSubmitEnabled}>
                Submit
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
      <SiloAccordion className="my-4" disabled={isDisabled} licencePlate={snap.currentProduct?.licencePlate} />
    </div>
  );
});
