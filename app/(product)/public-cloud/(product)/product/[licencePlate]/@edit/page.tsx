'use client';

import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PublicCloudEditRequestBodySchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviousButton from '@/components/buttons/Previous';
import ReturnModal from '@/components/modal/Return';
import ProjectDescription from '@/components/form/ProjectDescriptionPublic';
import TeamContacts from '@/components/form/TeamContacts';
import { useQuery, useMutation } from '@tanstack/react-query';
import SubmitButton from '@/components/buttons/SubmitButton';
import { PublicCloudProjectWithUsers } from '@/app/api/public-cloud/project/[licencePlate]/route';
import { PublicCloudRequestWithCurrentAndRequestedProject } from '@/app/api/public-cloud/request/[id]/route';
import Budget from '@/components/form/Budget';
import AccountCoding from '@/components/form/AccountCoding';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';
import { AGMinistries } from '@/constants';
import ExpenseAuthority from '@/components/form/ExpenseAuthority';
import { z } from 'zod';

import {
  getPublicCloudProject,
  getPublicCloudActiveRequest,
  editPublicCloudProject,
} from '@/services/backend/public-cloud';

export default function EditProject({ params }: { params: { licencePlate: string } }) {
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);
  const [openComment, setOpenComment] = useState(false);

  const { data: project } = useQuery<PublicCloudProjectWithUsers, Error>({
    queryKey: ['project', params.licencePlate],
    queryFn: () => getPublicCloudProject(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const { data: activeRequest, isError: isActiveRequestError } = useQuery<
    PublicCloudRequestWithCurrentAndRequestedProject,
    Error
  >({
    queryKey: ['request', params.licencePlate],
    queryFn: () => getPublicCloudActiveRequest(params.licencePlate),
    enabled: !!params.licencePlate,
  });

  const {
    mutateAsync: editProject,
    isPending: isEditingProject,
    isError: isEditError,
    error: editError,
  } = useMutation({
    mutationFn: (data: any) => editPublicCloudProject(params.licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

  useEffect(() => {
    setDisabled(isActiveRequestError);
  }, [isActiveRequestError]);

  const methods = useForm({
    resolver: zodResolver(
      PublicCloudEditRequestBodySchema.merge(
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
      const response = await getPublicCloudProject(params.licencePlate);
      return { ...response, isAgMinistryChecked: true };
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (activeRequest) {
      setDisabled(true);
    }
  }, [activeRequest]);

  const handleOpenModal = () => {
    setOpenComment(true);
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
    if (project?.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }
  }, [project]);

  const setComment = (requestComment: string) => {
    editProject({ ...methods.getValues(), requestComment });
  };

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(handleOpenModal)}>
          <div className="space-y-12">
            <ProjectDescription disabled={isDisabled} mode="edit" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <ExpenseAuthority disabled={isDisabled} />
            <Budget disabled={false} />
            <AccountCoding accountCodingInitial={project?.accountCoding} disabled={false} />
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
        redirectUrl="/public-cloud/products/active-requests"
        modalTitle="Thank you! We have received your edit."
        modalMessage="We have received your edit for this product. The Product Owner and Technical Lead(s) will receive a summary via email."
      />
    </div>
  );
}
