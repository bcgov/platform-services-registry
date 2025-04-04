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
import AdditionalTeamMembers from '@/components/public-cloud/sections/AdditionalTeamMembers';
import TeamContacts from '@/components/public-cloud/sections/TeamContacts';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePublicProductState } from '@/states/global';
import { publicCloudEditRequestBodySchema } from '@/validation-schemas/public-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductEdit = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductEdit(({ session }) => {
  const [, snap] = usePublicProductState();
  const [isDisabled, setDisabled] = useState(false);

  const methods = useForm({
    resolver: zodResolver(publicCloudEditRequestBodySchema),
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
      componentArgs: { selected: snap.currentProduct.environmentsEnabled, mode: 'edit', disabled: isDisabled },
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
