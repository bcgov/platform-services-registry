'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconCode } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Repositories from '@/components/form/Repositories';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudProductEditSubmitModal } from '@/components/modal/privateCloudProductEditSubmit';
import Quotas from '@/components/private-cloud/sections/Quotas';
import TeamContacts from '@/components/private-cloud/sections/TeamContacts';
import SiloAccordion from '@/components/private-cloud/SiloAccordion';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { areOnlyRepositoryFieldsDirty, getRepositoryFormValues } from '@/helpers/repository';
import { ResourceRequestsEnv } from '@/prisma/client';
import { getQuotaChangeStatus, updatePrivateCloudProductRepositories } from '@/services/backend/private-cloud/products';
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
  const [state, snap] = usePrivateProductState();
  const currentProduct = snap.currentProduct;
  const [isDisabled, setDisabled] = useState(false);

  type PrivateCloudEditRequestInput = z.input<typeof privateCloudEditRequestBodySchema>;
  type PrivateCloudEditRequestOutput = z.output<typeof privateCloudEditRequestBodySchema>;

  const methods = useForm<PrivateCloudEditRequestInput, unknown, PrivateCloudEditRequestOutput>({
    resolver: async (values, context, options) => {
      const { resourceRequests } = values;

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
      )(values, context, options);
    },
    defaultValues: {
      hasRepositories: null,
      repositories: [],
      isAgMinistry: false,
      isAgMinistryChecked: true,
    },
  });

  const { formState, reset } = methods;

  useEffect(() => {
    if (!currentProduct) return;

    setDisabled(!currentProduct._permissions.edit);

    reset(
      {
        ...currentProduct,
        ...getRepositoryFormValues(currentProduct),
        isAgMinistry: false,
        isAgMinistryChecked: true,
      },
      {
        keepDirtyValues: true,
      },
    );
  }, [currentProduct, reset]);

  const isSubmitEnabled = Object.keys(formState.dirtyFields).length > 0;

  if (!currentProduct) {
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
        canToggleTemporary: currentProduct._permissions.toggleTemporary,
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team members',
      description: '',
      Component: TeamContacts,
      componentArgs: {
        isTeamContactsDisabled: isDisabled,
        isAdditionalMembersDisabled: isDisabled || !currentProduct._permissions.manageMembers,
      },
    },
    {
      LeftIcon: IconCode,
      label: 'Repositories',
      description: '',
      Component: Repositories,
      componentArgs: {
        disabled: isDisabled,
      },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas (request)',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: currentProduct.licencePlate,
        cluster: currentProduct.cluster,
        isGoldDR: currentProduct.golddrEnabled ?? false,
        originalResourceRequests: currentProduct.resourceRequests,
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
            const onlyRepositoriesChanged = areOnlyRepositoryFieldsDirty(methods.formState.dirtyFields);

            if (onlyRepositoriesChanged) {
              await updatePrivateCloudProductRepositories(currentProduct.licencePlate, {
                hasRepositories: formData.hasRepositories,
                repositories: formData.repositories,
              });

              state.currentProduct = {
                ...currentProduct,
                hasRepositories: formData.hasRepositories,
                repositories: formData.repositories,
              };

              reset({
                ...methods.getValues(),
                hasRepositories: formData.hasRepositories,
                repositories: formData.repositories,
              });
              return;
            }
            await openPrivateCloudProductEditSubmitModal({
              productData: formData,
              originalProductData: currentProduct,
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

      <SiloAccordion className="my-4" product={currentProduct} />
    </div>
  );
});
