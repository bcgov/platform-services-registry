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
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import AccountCoding from '@/components/form/AccountCoding';
import AccountEnvironmentsPublic from '@/components/form/AccountEnvironmentsPublic';
import Budget from '@/components/form/Budget';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import ProjectDescriptionPublic from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import CreatePublicCloud from '@/components/modal/CreatePublicCloud';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { existBilling } from '@/services/backend/billing';
import { createPublicCloudProject } from '@/services/backend/public-cloud/products';
import { publicCloudCreateRequestBodySchema } from '@/validation-schemas/public-cloud';

const publicCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});
export default publicCloudProductNew(({ pathParams, queryParams, session }) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);

  const {
    mutateAsync: createProject,
    isPending: isCreatingProject,
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationFn: (data: any) => createPublicCloudProject(data),
    onSuccess: () => {
      setOpenCreate(false);
      setOpenReturn(true);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        notifications.show({
          title: 'Unauthorized',
          message:
            'You are not authorized to create this product. Please ensure you are mentioned in the product contacts to proceed.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: `Failed to create product: ${error.message}`,
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });

  const methods = useForm({
    resolver: zodResolver(
      publicCloudCreateRequestBodySchema
        .merge(
          z.object({
            isAgMinistryChecked: z.boolean().optional(),
            isEaApproval: z.boolean().optional(),
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
        )
        .refine(
          async (formData) => {
            const hasBilling = await existBilling(formData.accountCoding, formData.provider);
            if (!hasBilling) return true;
            return formData.isEaApproval;
          },
          {
            message: 'EA Approval Checkbox should be checked.',
            path: ['isEaApproval'],
          },
        ),
    ),
    defaultValues: {
      environmentsEnabled: {
        production: true,
      },
      budget: {
        dev: 50,
        test: 50,
        prod: 50,
        tools: 50,
      },
    } as any,
  });

  const handleSubmit = async (data: any) => {
    createProject(data);
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescriptionPublic,
      componentArgs: {
        mode: 'create',
      },
    },
    {
      LeftIcon: IconLayoutGridAdd,
      label: 'Accounts to create',
      description: '',
      Component: AccountEnvironmentsPublic,
      componentArgs: { mode: 'create' },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconUserDollar,
      label: 'Expense authority',
      description: '',
      Component: ExpenseAuthority,
      componentArgs: {},
    },
    {
      LeftIcon: IconMoneybag,
      label: 'Project budget',
      description: '',
      Component: Budget,
      componentArgs: {},
    },
    {
      LeftIcon: IconReceipt2,
      label: 'Billing (account coding)',
      description: '',
      Component: AccountCoding,
      componentArgs: {},
    },
  ];

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        New Public Cloud Product
      </h1>
      <h3 className="mt-0 mb-3 italic">Public Cloud Landing Zone</h3>

      <FormProvider {...methods}>
        <FormErrorNotification />
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenCreate(true))}>
          <PageAccordion items={accordionItems} />

          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            <button
              type="submit"
              className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              SUBMIT REQUEST
            </button>
          </div>
        </form>
        <CreatePublicCloud
          open={openCreate}
          setOpen={setOpenCreate}
          handleSubmit={methods.handleSubmit(handleSubmit)}
          isLoading={isCreatingProject}
        />
      </FormProvider>

      <ReturnModal
        isPublicCreate
        open={openReturn}
        setOpen={setOpenReturn}
        redirectUrl="/public-cloud/requests/all"
        modalTitle="Thank you! We have received your create request."
        modalMessage="We have received your create request for a new product. The Product Owner and Technical Lead(s) will receive the approval/rejection decision via email."
      />
    </div>
  );
});
