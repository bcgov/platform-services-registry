'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PublicCloudEditRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import CreateModal from '@/components/modal/CreatePublicCloud';
import ReturnModal from '@/components/modal/Return';
import { useRouter } from 'next/navigation';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import { useQuery } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PublicCloudProjectWithUsers } from '@/app/api/public-cloud/project/[licencePlate]/route';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';

async function fetchProject(licencePlate: string): Promise<PublicCloudProjectWithUsers> {
  const res = await fetch(`/api/public-cloud/project/${licencePlate}`);
  if (!res.ok) {
    throw new Error('Network response was not ok for fetch project');
  }

  // Re format data to work with form
  const data = await res.json();

  // Secondaty technical lead should only be included if it exists
  if (data.secondaryTechnicalLead === null) {
    delete data.secondaryTechnicalLead;
  }

  return data;
}

async function fetchActiveRequest(licencePlate: string): Promise<PublicCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/public-cloud/active-request/${licencePlate}`);

  if (!res.ok) {
    throw new Error('Network response was not ok for fetch active request');
  }

  // Re format data to work with form
  const data = await res.json();

  return data;
}

export default function EditProject({ params }: { params: { licencePlate: string } }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);
  const [openComment, setOpenComment] = useState(false);

  const { data } = useQuery<PublicCloudProjectWithUsers, Error>({
    queryKey: ['project', params.licencePlate],
    queryFn: () => fetchProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const { data: requestData } = useQuery<PublicCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['request', params.licencePlate],
    queryFn: () =>
      fetchActiveRequest(params.licencePlate).catch((error) => {
        console.log('error', error);
        setDisabled(true);
        return Promise.reject(error);
      }),
    enabled: !!params.licencePlate,
  });

  const methods = useForm({
    resolver: zodResolver(PublicCloudEditRequestBodySchema),
    defaultValues: async () => {
      const response = await fetchProject(params.licencePlate);
      return response;
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (requestData) {
      setDisabled(true);
    }
  }, [requestData]);

  const handleOpenModal = () => {
    setOpenComment(true);
  };

  const onSubmit = async (val: any) => {
    console.log('SUBMIT', val);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/public-cloud/edit/${params.licencePlate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(val),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok for edit request');
      }

      setOpenComment(false);
      setOpenReturn(true);
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
    }
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
      setIsSecondaryTechLeadRemoved(true);
    }
  };

  const isSubmitEnabled = formState.isDirty || isSecondaryTechLeadRemoved;

  useEffect(() => {
    if (data?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [data]);

  const setComment = (requestComment: string) => {
    onSubmit({ ...methods.getValues(), requestComment });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(handleOpenModal)}>
          <div className="space-y-12">
            <ProjectDescription disabled={isDisabled} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Budget disabled={false} />
            <AccountCoding accountCodingInitial={data?.accountCoding} disabled={false} />
          </div>
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
        isLoading={isLoading}
        type="create"
      />
      <ReturnModal
        open={openReturn}
        setOpen={setOpenReturn}
        redirectUrl="/public-cloud/products/active-requests"
        modalTitle="Thank you! We have received your edit."
        modalMessage="We have received your edit for this product. The Product Owner and Technical Lead(s) will receive a summary via email."
      />
    </div>
  );
}
