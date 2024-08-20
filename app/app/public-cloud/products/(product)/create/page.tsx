'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
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
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import CreatePublicCloud from '@/components/modal/CreatePublicCloud';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries } from '@/constants';
import createClientPage from '@/core/client-page';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import { existBilling } from '@/services/backend/billing';
import { createPublicCloudProject } from '@/services/backend/public-cloud/products';

const publicCloudProductNew = createClientPage({
  roles: ['user'],
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
      PublicCloudCreateRequestBodySchema.merge(
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
            const hasBilling = await existBilling(formData.accountCoding);
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

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-4 lg:mt-4 lg:mb-8">
        Public Cloud Landing Zone
      </h1>

      <FormProvider {...methods}>
        <FormErrorNotification />
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenCreate(true))}>
          <div className="space-y-12">
            <ProjectDescriptionPublic mode="create" />
            <hr className="my-7" />
            <AccountEnvironmentsPublic mode="create" />
            <hr className="my-7" />
            <TeamContacts secondTechLead={secondTechLead} secondTechLeadOnClick={secondTechLeadOnClick} />
            <hr className="my-7" />
            <ExpenseAuthority />
            <hr className="my-7" />
            <Budget />
            <hr className="my-7" />
            <AccountCoding />
          </div>
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
      </FormProvider>
      <CreatePublicCloud
        open={openCreate}
        setOpen={setOpenCreate}
        handleSubmit={methods.handleSubmit(handleSubmit)}
        isLoading={isCreatingProject}
      />
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
