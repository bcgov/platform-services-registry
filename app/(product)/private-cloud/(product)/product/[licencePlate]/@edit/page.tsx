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
import { useQuery, useMutation } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PrivateCloudProjectWithUsers } from '@/app/api/private-cloud/project/[licencePlate]/route';
import { PrivateCloudRequestWithCurrentAndRequestedProject } from '@/app/api/private-cloud/request/[id]/route';
import CommonComponents from '@/components/form/CommonComponents';
import { PrivateCloudProject } from '@prisma/client';
import { AGMinistries } from '@/constants';
import { z } from 'zod';
import {
  getPriviateCloudProject,
  getPriviateCloudActiveRequest,
  editPriviateCloudProject,
} from '@/services/backend/private-cloud';

export default function EditProject({ params }: { params: { licencePlate: string } }) {
  const { data: session, status } = useSession({
    required: true,
  });

  const [openComment, setOpenComment] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const { data: project, isSuccess } = useQuery<PrivateCloudProjectWithUsers, Error>({
    queryKey: ['project', params.licencePlate],
    queryFn: () => getPriviateCloudProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const { data: activeRequest, isError: isActiveRequestError } = useQuery<
    PrivateCloudRequestWithCurrentAndRequestedProject,
    Error
  >({
    queryKey: ['request', params.licencePlate],
    queryFn: () => getPriviateCloudActiveRequest(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const {
    mutateAsync: editProject,
    isPending: isEditingProject,
    isError: isEditError,
    error: editError,
  } = useMutation({
    mutationFn: (data: any) => editPriviateCloudProject(params.licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

  useEffect(() => {
    setDisabled(isActiveRequestError);
  }, [isActiveRequestError]);

  // The data is not available on the first render so fetching it inside the defaultValues. This is a workaround. Not doing this will result in
  // in an error.
  const methods = useForm({
    resolver: zodResolver(
      PrivateCloudEditRequestBodySchema.merge(
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
    defaultValues: async () => {
      const response = await getPriviateCloudProject(params.licencePlate);
      return { ...response, isAgMinistryChecked: true };
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (activeRequest) {
      setDisabled(true);
    }
  }, [activeRequest]);

  useEffect(() => {
    if (project?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [project]);

  useEffect(() => {
    if (project?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [project]);

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
            <ProjectDescription disabled={isDisabled} clusterDisabled={true} mode="edit" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Quotas
              licensePlate={project?.licencePlate as string}
              disabled={isDisabled}
              currentProject={project as PrivateCloudProject}
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
        isLoading={isEditingProject}
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
