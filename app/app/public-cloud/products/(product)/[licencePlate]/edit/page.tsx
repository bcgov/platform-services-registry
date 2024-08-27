'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import {
  IconInfoCircle,
  IconUsersGroup,
  IconUserDollar,
  IconSettings,
  IconComponents,
  IconMessage,
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
import PageAccordion from '@/components/form/PageAccordion';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPublicCloudProject, editPublicCloudProject } from '@/services/backend/public-cloud/products';
import { publicProductState } from '@/states/global';
import { publicCloudEditRequestBodySchema } from '@/validation-schemas/public-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductEdit = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default publicCloudProductEdit(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const snap = useSnapshot(publicProductState);

  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);
  const [openComment, setOpenComment] = useState(false);

  const {
    mutateAsync: editProject,
    isPending: isEditingProject,
    isError: isEditError,
    error: editError,
  } = useMutation({
    mutationFn: (data: any) => editPublicCloudProject(licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to edit product: ${error.message}`,
        color: 'red',
        autoClose: 5000,
      });
    },
  });

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
    defaultValues: async () => {
      const response = await getPublicCloudProject(licencePlate);
      return { ...response, isAgMinistryChecked: true, accountCoding: response.billing.accountCoding };
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

  const setComment = (requestComment: string) => {
    editProject({ ...methods.getValues(), requestComment });
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
      label: 'Billing (account coding)',
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
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenComment(true))}>
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {!isDisabled ? (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton text="SUBMIT EDIT REQUEST" disabled={!isSubmitEnabled} />
              </div>
            ) : null}
          </div>
        </form>
      </FormProvider>
      <PrivateCloudEditModal
        open={openComment}
        setOpen={setOpenComment}
        handleSubmit={setComment}
        isLoading={isEditingProject}
      />
      <ReturnModal
        open={openReturn}
        setOpen={setOpenReturn}
        redirectUrl="/public-cloud/requests/all"
        modalTitle="Thank you! We have received your edit."
        modalMessage="We have received your edit for this product. The Product Owner and Technical Lead(s) will receive a summary via email."
      />
    </div>
  );
});
