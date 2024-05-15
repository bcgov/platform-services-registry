'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PrivateCloudProject } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSnapshot } from 'valtio';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import CommonComponents from '@/components/form/CommonComponents';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries } from '@/constants';
import createClientPage from '@/core/client-page';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { getPrivateCloudProject, editPrivateCloudProject } from '@/services/backend/private-cloud/products';
import { privateProductState } from '@/states/global';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductEdit = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductEdit(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const snap = useSnapshot(privateProductState);

  const [openComment, setOpenComment] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const {
    mutateAsync: editProject,
    isPending: isEditingProject,
    isError: isEditError,
    error: editError,
  } = useMutation({
    mutationFn: (data: any) => editPrivateCloudProject(licencePlate, data),
    onSuccess: () => {
      setOpenComment(false);
      setOpenReturn(true);
    },
  });

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
      const response = await getPrivateCloudProject(licencePlate);
      return { ...response, isAgMinistryChecked: true };
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

  const isSubmitEnabled = formState.isDirty || isSecondaryTechLeadRemoved;

  if (!snap.currentProduct) {
    return null;
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenComment(true))}>
          <div className="mb-12 mt-8">
            <ProjectDescription disabled={isDisabled} clusterDisabled={true} mode="edit" />
            <hr className="my-7" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <hr className="my-7" />
            <Quotas
              licencePlate={snap.currentProduct?.licencePlate as string}
              disabled={isDisabled}
              currentProject={snap.currentProduct as PrivateCloudProject}
            />
            <hr className="my-7" />
            <CommonComponents disabled={isDisabled} number={4} />
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
        redirectUrl="/private-cloud/requests/all"
        modalTitle="Thank you! We have received your edit request."
        modalMessage="We have received your edit request for your product. The Product Owner and Technical Lead(s) will receive the approval/rejection decision via email."
      />
    </div>
  );
});
