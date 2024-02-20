'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import { useSession } from 'next-auth/react';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';
import ReturnModal from '@/components/modal/Return';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import Quotas from '@/components/form/Quotas';
import { useQuery } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PrivateCloudProjectWithUsers } from '@/app/api/private-cloud/project/[licencePlate]/route';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import CommonComponents from '@/components/form/CommonComponents';
import { PrivateCloudProject } from '@prisma/client';

async function fetchProject(licencePlate: string): Promise<PrivateCloudProjectWithUsers> {
  const res = await fetch(`/api/private-cloud/project/${licencePlate}`);
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

async function fetchActiveRequest(licencePlate: string): Promise<PrivateCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/private-cloud/active-request/${licencePlate}`);

  if (!res.ok) {
    throw new Error('Network response was not ok for fetch active request');
  }

  // Re format data to work with form
  const data = await res.json();

  return data;
}

export default function EditProject({ params }: { params: { licencePlate: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openComment, setOpenComment] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const { data, isSuccess } = useQuery<PrivateCloudProjectWithUsers, Error>({
    queryKey: ['project', params.licencePlate],
    queryFn: () => fetchProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const { data: requestData } = useQuery<PrivateCloudRequestWithCurrentAndRequestedProject, Error>({
    queryKey: ['request', params.licencePlate],
    queryFn: () =>
      fetchActiveRequest(params.licencePlate).catch((error) => {
        console.log('error', error);
        setDisabled(true);
        return Promise.reject(error);
      }),
    enabled: !!params.licencePlate,
  });

  // The data is not available on the first render so fetching it inside the defaultValues. This is a workaround. Not doing this will result in
  // in an error.
  const methods = useForm({
    resolver: zodResolver(PrivateCloudEditRequestBodySchema),
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

  useEffect(() => {
    if (data?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [data]);

  useEffect(() => {
    if (data?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [data]);

  const onSubmit = async (val: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/private-cloud/edit/${params.licencePlate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(val),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok for create request');
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

  const setComment = (userComment: string) => {
    onSubmit({ ...methods.getValues(), userComment });
  };

  const isSubmitEnabled = formState.isDirty || isSecondaryTechLeadRemoved;

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenComment(true))}>
          <div className="mb-12 mt-8">
            {isDisabled && (
              <h3 className="font-bcsans text-base lg:text-md 2xl:text-lg text-gray-600 mb-5">
                There is already an active request for this project. You can not edit this project at this time.
              </h3>
            )}
            <ProjectDescription disabled={isDisabled} clusterDisabled={true} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={data?.licencePlate as string}
              disabled={isDisabled}
              currentProject={data as PrivateCloudProject}
            />
            <CommonComponents disabled={isDisabled} />
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
        redirectUrl="/private-cloud/products/active-requests"
        modalTitle="Thank you! We have received your edit request."
        modalMessage="We have received your edit request for your product. The Product Owner and Technical Lead(s) will receive the approval/rejection decision via email."
      />
    </div>
  );
}
