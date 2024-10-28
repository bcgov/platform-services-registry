'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconLayoutGridAdd,
  IconMoneybag,
  IconReceipt2,
} from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSnapshot } from 'valtio';
import { z } from 'zod';
import PublicCloudBillingInfo from '@/components/billing/PublicCloudBillingInfo';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPublicCloudProductEditSubmitModal } from '@/components/modal/publicCloudProductEditSubmit';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries, GlobalRole } from '@/constants';
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
export default publicCloudProductEdit(({}) => {
  const [, snap] = usePublicProductState();
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      publicCloudEditRequestBodySchema
        .merge(
          z.object({
            isAgMinistryChecked: z.boolean().optional(),
          }),
        )
        .refine(
          (formData) => {
            return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
          },
          {
            message: 'AG Ministry Checkbox should be checked.',
            path: ['isAgMinistryChecked'],
          },
        ),
    ),
    defaultValues: {
      ...snap.currentProduct,
      isAgMinistryChecked: true,
      accountCoding: snap.currentProduct?.billing.accountCoding,
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
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconUserDollar,
      label: 'Expense authority',
      description: '',
      Component: ExpenseAuthority,
      componentArgs: {
        disabled: isDisabled,
      },
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: { disabled: isDisabled },
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (Account coding)',
      description: '',
      Component: AccountCoding,
      componentArgs: { accountCodingInitial: snap.currentProduct?.billing.accountCoding, disabled: true },
    },
  ];

  const isSubmitEnabled = formState.isDirty || isSecondaryTechLeadRemoved;

  return (
    <div>
      <PublicCloudBillingInfo product={snap.currentProduct} className="mb-2" />
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          autoComplete="off"
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPublicCloudProductEditSubmitModal({ productData: formData });
          })}
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
