'use client';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import CreateModal from '@/components/modal/CreatePublicCloud';
import ReturnModal from '@/components/modal/Return';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import { AGMinistries } from '@/constants';
import { z } from 'zod';

export default function Page() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      PublicCloudCreateRequestBodySchema.merge(
        z.object({
          isAgMinistryChecked: z.boolean().optional(),
        }),
      ).refine(
        (formData) => {
          return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
        },
        {
          message: 'AG Ministry Checkbox should be checked.',
          path: ['isAgMinistryChecked'],
        },
      ),
    ),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/public-cloud/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('response', response);

      if (!response.ok) {
        throw new Error('Network response was not ok for create request');
      }

      setOpenCreate(false);
      setOpenReturn(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenCreate(true))}>
          <div className="space-y-12">
            <ProjectDescription mode="create" />
            <TeamContacts secondTechLead={secondTechLead} secondTechLeadOnClick={secondTechLeadOnClick} />
            <ExpenseAuthority />
            <Budget />
            <AccountCoding />
          </div>
          <div className="mt-10 flex items-center justify-start gap-x-6">
            <PreviousButton />
            <button
              type="submit"
              className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              SUBMIT REQUEST
            </button>
          </div>
        </form>
      </FormProvider>
      <CreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        handleSubmit={methods.handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
      <ReturnModal
        isPublicCreate
        open={openReturn}
        setOpen={setOpenReturn}
        redirectUrl="/public-cloud/products/active-requests"
        modalTitle="Thank you! We have received your create request."
        modalMessage="We have received your create request for a new product. The Product Owner and Technical Lead(s) will receive the approval/rejection decision via email."
      />
    </div>
  );
}
