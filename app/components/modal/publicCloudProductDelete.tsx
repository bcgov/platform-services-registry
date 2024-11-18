'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import ExternalLink from '@/components/generic/button/ExternalLink';
import MailLink from '@/components/generic/button/MailLink';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { publicCloudTeamEmail } from '@/constants';
import { createModal } from '@/core/modal';
import { deletePublicCloudProject } from '@/services/backend/public-cloud/products';
import { PublicCloudProductDetailDecorated } from '@/types/public-cloud';
import { openNotificationModal } from './notification';

interface ModalProps {
  product: PublicCloudProductDetailDecorated;
}

interface ModalState {
  success: boolean;
}

export const openPublicCloudProductDeleteModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: 'Please confirm your delete request',
  },
  Component: function ({ product, state, closeModal }) {
    const methods = useForm({
      resolver: zodResolver(
        z.object({
          licencePlate: z.literal(product.licencePlate),
          email: z.literal(product.projectOwner.email),
        }),
      ),
      defaultValues: {
        licencePlate: '',
        email: '',
      },
    });

    const {
      mutateAsync: deleteProduct,
      isPending: isDeletingProduct,
      isError: isDeleteProductError,
      error: deleteProductError,
    } = useMutation({
      mutationFn: () => deletePublicCloudProject(product.licencePlate),
    });

    const { handleSubmit, register } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isDeletingProduct} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        {product?.expenseAuthorityId ? (
          <>
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/public/intro/#closure">
              Account closure and project set deletion
            </ExternalLink>

            <Divider my="md" />

            <div className="space-y-1">
              <span className="flex">
                <p className="text-sm font-medium text-gray-900">Product name: </p>
                <p className="text-sm text-gray-900 ml-2">{product.name}</p>
              </span>
              <span className="flex">
                <p className="text-sm font-medium text-gray-900">Licence plate: </p>
                <p className="text-sm text-gray-900 ml-2">{product.licencePlate}</p>
              </span>
              <span className="flex">
                <p className="text-sm font-medium text-gray-900">Product Owner: </p>
                <p className="text-sm text-gray-900 ml-2">{product.projectOwner.email.toLocaleLowerCase()}</p>
              </span>
            </div>

            <p className="mt-8 text-sm">
              Are you sure you want to delete this product? Enter the following data to proceed:
            </p>

            <FormProvider {...methods}>
              <form
                autoComplete="off"
                onSubmit={handleSubmit(async () => {
                  const res = await deleteProduct();
                  if (res) {
                    closeModal();
                    await openNotificationModal(
                      {
                        callbackUrl: '/public-cloud/products/all',
                        content: (
                          <>
                            <p className="text-sm text-gray-900">
                              We have received your delete request for this product. The Product Owner and Technical
                              Lead(s) will receive an update via email.
                            </p>
                            <p className="text-sm text-gray-900 mt-4">
                              Alternatively, you can also track the status of your requests from the Registry App
                              Dashboard
                            </p>
                          </>
                        ),
                      },
                      {
                        settings: {
                          title: 'Thank you! We have received your delete request.',
                        },
                      },
                    );
                  }
                })}
              >
                <HookFormTextInput
                  name="licencePlate"
                  placeholder="Licence plate number"
                  classNames={{ wrapper: 'mt-1' }}
                />
                <HookFormTextInput name="email" placeholder="Product owner email" classNames={{ wrapper: 'mt-1' }} />

                <Divider my="md" />

                <Grid className="mt-2">
                  <Grid.Col span={4}>
                    <p className="text-sm text-red-500 font-bold">This operation cannot be undone.</p>
                  </Grid.Col>
                  <Grid.Col span={8} className="text-right">
                    <Button color="gray" onClick={() => closeModal()} className="mr-1">
                      Cancel
                    </Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </Grid.Col>
                </Grid>
              </form>
            </FormProvider>
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Expense Authority Form Required for Product Deletion
            </h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm text-yellow-600">
                <div className="flex">
                  <IconExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                  Attention:
                </div>
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              Before proceeding with the deletion of this product, please note that you are required to fill out the
              Expense Authority Form. This form is necessary to ensure proper authorization for any expenses related to
              this product.
            </p>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Why is the Expense Authority Form Required?</h3>
            <p className="text-sm font-medium text-gray-900">
              The Expense Authority Form helps us maintain transparency and accountability in our expense management
              process. It ensures that all deletions and associated costs are approved by the appropriate authorities
              within your organization.
            </p>
            <p className="text-sm font-medium text-gray-900">
              Once your Expense Authority Form has been filled in, you will be able to proceed with the deletion of the
              product.
            </p>
            <p className="text-sm font-medium text-gray-900">
              Thank you for your cooperation and understanding. If you have any questions or need further assistance,
              please don&apos;t hesitate to contact our support team <MailLink to={publicCloudTeamEmail} />
            </p>
          </div>
        )}
      </Box>
    );
  },
  onClose: () => {},
});
