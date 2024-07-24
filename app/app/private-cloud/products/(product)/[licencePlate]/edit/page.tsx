'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
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
import QuotasChangeInfo from '@/components/form/QuotasChangeInfo';
import TeamContacts from '@/components/form/TeamContacts';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import PrivateCloudEditModal from '@/components/modal/EditPrivateCloud';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries } from '@/constants';
import createClientPage from '@/core/client-page';
import { comparePrivateProductData, PrivateProductChange } from '@/helpers/product-change';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { getPrivateCloudProject, editPrivateCloudProject } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductEdit = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductEdit(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const [, privateSnap] = usePrivateProductState();

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
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: `Failed to edit product ${error.message}`,
        color: 'red',
        autoClose: 5000,
      });
    },
  });

  // The data is not available on the first render so fetching it inside the defaultValues. This is a workaround. Not doing this will result in
  // in an error.
  const methods = useForm({
    resolver: (...args) => {
      const _changes = comparePrivateProductData(privateSnap.currentProduct, args[0]);

      return zodResolver(
        PrivateCloudEditRequestBodySchema.merge(
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
          )
          .refine(
            (formData) => {
              if (!_changes?.quotasIncrease) return true;
              return !!formData.quotaContactName;
            },
            {
              message: 'Contact name should be provided.',
              path: ['quotaContactName'],
            },
          )
          .refine(
            (formData) => {
              if (!_changes?.quotasIncrease) return true;
              return !!formData.quotaContactEmail;
            },
            {
              message: 'Contact email should be provided.',
              path: ['quotaContactEmail'],
            },
          )
          .refine(
            (formData) => {
              if (!_changes?.quotasIncrease) return true;
              return !!formData.quotaJustification;
            },
            {
              message: 'Quota justification should be provided.',
              path: ['quotaJustification'],
            },
          )
          .transform((formData) => {
            if (!_changes?.quotasIncrease) {
              formData.quotaContactName = '';
              formData.quotaContactEmail = '';
              formData.quotaJustification = '';
            }

            return formData;
          }),
      )(...args);
    },
    defaultValues: async () => {
      const response = await getPrivateCloudProject(licencePlate);
      return { ...response, isAgMinistryChecked: true };
    },
  });

  const { formState } = methods;

  useEffect(() => {
    if (!privateSnap.currentProduct) return;

    if (privateSnap.currentProduct.secondaryTechnicalLead) {
      setSecondTechLead(true);
    }

    setDisabled(!privateSnap.currentProduct?._permissions.edit);
  }, [privateSnap.currentProduct]);

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

  if (!privateSnap.currentProduct) {
    return null;
  }

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form autoComplete="off" onSubmit={methods.handleSubmit(() => setOpenComment(true))}>
          <div className="mb-12 mt-8">
            <ProjectDescription
              disabled={isDisabled}
              clusterDisabled={true}
              mode="edit"
              canToggleTemporary={privateSnap.currentProduct._permissions.toggleTemporary}
            />
            <hr className="my-7" />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <hr className="my-7" />
            <Quotas
              licencePlate={privateSnap.currentProduct?.licencePlate as string}
              disabled={isDisabled}
              currentProject={privateSnap.currentProduct as PrivateCloudProject}
            />
            <QuotasChangeInfo disabled={isDisabled} />
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
