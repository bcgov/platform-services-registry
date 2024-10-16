'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CPU, Memory, Storage, PrivateCloudProject } from '@prisma/client';
import { IconInfoCircle, IconUsersGroup, IconSettings, IconComponents } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import SubmitButton from '@/components/buttons/SubmitButton';
import CommonComponents from '@/components/form/CommonComponents';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import Quotas from '@/components/form/Quotas';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openEditPrivateCloudProductModal } from '@/components/modal/editPrivateCloudProductModal';
import ReturnModal from '@/components/modal/Return';
import { AGMinistries, GlobalRole, defaultQuota } from '@/constants';
import createClientPage from '@/core/client-page';
import { getPrivateCloudProject, getQuotaChangeStatus } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { privateCloudEditRequestBodySchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductEdit = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});
export default privateCloudProductEdit(({ pathParams, queryParams, session }) => {
  const [, privateSnap] = usePrivateProductState();
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isSecondaryTechLeadRemoved, setIsSecondaryTechLeadRemoved] = useState(false);

  const methods = useForm({
    resolver: async (...args) => {
      const { developmentQuota, testQuota, productionQuota, toolsQuota } = args[0];

      const quotaChangeStatus = await getQuotaChangeStatus(privateSnap.licencePlate, {
        developmentQuota,
        testQuota,
        productionQuota,
        toolsQuota,
      });

      return zodResolver(
        privateCloudEditRequestBodySchema
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
          )
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaContactName;
            },
            {
              message: 'Contact name should be provided.',
              path: ['quotaContactName'],
            },
          )
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaContactEmail;
            },
            {
              message: 'Contact email should be provided.',
              path: ['quotaContactEmail'],
            },
          )
          .refine(
            (formData) => {
              if (quotaChangeStatus.isEligibleForAutoApproval) return true;
              return !!formData.quotaJustification;
            },
            {
              message: 'Quota justification should be provided.',
              path: ['quotaJustification'],
            },
          )
          .transform((formData) => {
            if (quotaChangeStatus.isEligibleForAutoApproval) {
              formData.quotaContactName = '';
              formData.quotaContactEmail = '';
              formData.quotaJustification = '';
            }

            return formData;
          }),
      )(...args);
    },
    values: {
      developmentQuota: defaultQuota,
      testQuota: defaultQuota,
      productionQuota: defaultQuota,
      toolsQuota: defaultQuota,
      ...privateSnap.currentProduct,
      isAgMinistryChecked: true,
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

  const isSubmitEnabled = Object.keys(formState.dirtyFields).length > 0 || isSecondaryTechLeadRemoved;

  if (!privateSnap.currentProduct) {
    return null;
  }

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: {
        disabled: isDisabled,
        clusterDisabled: true,
        mode: 'edit',
        canToggleTemporary: privateSnap.currentProduct._permissions.toggleTemporary,
      },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { disabled: isDisabled, secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconSettings,
      label: 'Quotas',
      description: '',
      Component: Quotas,
      componentArgs: {
        disabled: isDisabled,
        licencePlate: privateSnap.currentProduct?.licencePlate as string,
        currentProject: privateSnap.currentProduct as PrivateCloudProject,
      },
    },
    {
      LeftIcon: IconComponents,
      label: 'Common components',
      description: '',
      Component: CommonComponents,
      componentArgs: { disabled: isDisabled },
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            const result = await openEditPrivateCloudProductModal({ productData: formData });
            if (result?.state.success) {
              setOpenReturn(true);
            }
          })}
          autoComplete="off"
        >
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
