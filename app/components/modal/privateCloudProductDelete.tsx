'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { IconExclamationCircle, IconCircleCheck } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { createModal } from '@/core/modal';
import { showErrorNotification } from '@/helpers/notifications';
import {
  deletePrivateCloudProject,
  checkPrivateCloudProductDeletionAvailability,
} from '@/services/backend/private-cloud/products';
import { PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { openCompleteModal } from './complete';

const OK_TO_DELETE = 'OK_TO_DELETE';

interface ModalProps {
  product: PrivateCloudProductDetailDecorated;
}

interface ModalState {
  success: boolean;
}

export const openPrivateCloudProductDeleteModal = createModal<ModalProps, ModalState>({
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
      data: deletionAvailability,
      isLoading: isCheckingDeletionAvailability,
      isError: isDeletionAvailabilityError,
      error: deletionAvailabilityError,
    } = useQuery<any, Error>({
      queryKey: ['apiAccount'],
      queryFn: () => checkPrivateCloudProductDeletionAvailability(product.licencePlate),
      enabled: !!product.licencePlate,
    });

    const {
      mutateAsync: deleteProduct,
      isPending: isDeletingProduct,
      isError: isDeleteProductError,
      error: deleteProductError,
    } = useMutation({
      mutationFn: () => deletePrivateCloudProject(product.licencePlate),
      onSuccess: () => {},
      onError: (error: any) => {
        showErrorNotification(error);
      },
    });

    const { handleSubmit, register } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay
          visible={isCheckingDeletionAvailability || isDeletingProduct}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        {deletionAvailability === OK_TO_DELETE ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-green-600">
              <div className="flex">
                <IconCircleCheck className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                Ready to Delete
              </div>
            </span>
            <p className="text-sm text-gray-500">Deletion check has passed.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-red-600">
              <div className="flex">
                <IconExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                Please remember to remove all pods and PVCs from all four namespaces before trying to delete again.
              </div>
            </span>
            <p className="text-sm text-gray-500">Deletion check has failed.</p>
          </div>
        )}

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

        {deletionAvailability === OK_TO_DELETE ? (
          <>
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
                    await openCompleteModal(
                      {
                        callbackUrl: '/private-cloud/products/all',
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
          <Grid className="mt-2">
            <Grid.Col span={4}>
              <p className="text-sm text-gray-500">You are unable to delete this product.</p>
            </Grid.Col>
            <Grid.Col span={8} className="text-right">
              <Button color="gray" onClick={() => closeModal()} className="mr-1">
                Cancel
              </Button>
            </Grid.Col>
          </Grid>
        )}
      </Box>
    );
  },
  onClose: () => {},
});
