'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { IconInfoCircle, IconUsersGroup, IconLayoutGridAdd, IconMoneybag } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudProductEditSubmitModal } from '@/components/modal/publicCloudProductEditSubmit';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { normalizeStoredAwsLzaAccounts } from '@/services/aws-lza/accounts';
import { usePublicProductState } from '@/states/global';
import { publicCloudEditRequestBodySchema } from '@/validation-schemas/public-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductEdit = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductEdit(() => {
  const [, snap] = usePublicProductState();
  const [isDisabled, setDisabled] = useState(false);

  const currentProduct = snap.currentProduct;

  const methods = useForm({
    resolver: zodResolver(publicCloudEditRequestBodySchema),
    defaultValues: {
      ...currentProduct,
      isAgMinistry: false,
      isAgMinistryChecked: true,
      requiresNetworking: currentProduct?.requiresNetworking ?? false,
      networkingReason: currentProduct?.networkingReason ?? '',
      environmentsEnabled: {
        ...currentProduct?.environmentsEnabled,
        productionRequiresNetworking: currentProduct?.environmentsEnabled?.productionRequiresNetworking ?? false,
        developmentRequiresNetworking: currentProduct?.environmentsEnabled?.developmentRequiresNetworking ?? false,
        testRequiresNetworking: currentProduct?.environmentsEnabled?.testRequiresNetworking ?? false,
        toolsRequiresNetworking: currentProduct?.environmentsEnabled?.toolsRequiresNetworking ?? false,
      },
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (!currentProduct) return;

    setDisabled(!currentProduct?._permissions.edit);
  }, [currentProduct]);

  const isSubmitEnabled = Object.keys(formState.dirtyFields).length > 0;

  if (!currentProduct) {
    return null;
  }

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescriptionPublic,
      componentArgs: {
        mode: 'edit',
        disabled: isDisabled,
        providerDisabled: true,
      },
    },
    {
      LeftIcon: IconLayoutGridAdd,
      label: 'Accounts to create',
      description: '',
      Component: AccountEnvironmentsPublic,
      componentArgs: {
        selected: currentProduct.environmentsEnabled,
        mode: 'edit',
        disabled: isDisabled,
        awsAccounts: normalizeStoredAwsLzaAccounts(currentProduct.awsAccounts),
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
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: { disabled: isDisabled },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPublicCloudProductEditSubmitModal({
              productData: formData,
              originalProductData: methods.getValues(),
            });
          })}
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
    </div>
  );
});
