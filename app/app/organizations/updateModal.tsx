'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import { FormProvider, useForm } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { createModal } from '@/core/modal';
import { Organization } from '@/prisma/client';
import { updateOrganization as _updateOrganization } from '@/services/backend/organizations';
import { organizationBodySchema } from '@/validation-schemas/organization';

interface ModalProps {
  id: string;
  code: string;
  name: string;
}
interface ModalState {}

export const openUpdateModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Update Organization',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ id, code, name, closeModal }) {
    const methods = useForm({
      resolver: zodResolver(organizationBodySchema),
      defaultValues: {
        code,
        name,
      },
    });

    const { mutateAsync: updateOrganization, isPending: isUpdatingOrganization } = useMutation({
      mutationFn: ({ code, name }: Omit<Organization, 'id'>) =>
        _updateOrganization(id, { code: code.toUpperCase(), name }),
    });

    const { handleSubmit, setError } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isUpdatingOrganization} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              await updateOrganization(formData);
              closeModal();
            })}
          >
            <HookFormTextInput label="Code" name="code" placeholder="Enter code..." required />
            <HookFormTextInput
              label="Name"
              name="name"
              placeholder="Enter name..."
              required
              classNames={{ wrapper: 'mt-1' }}
            />

            <Divider my="md" />

            <Grid>
              <Grid.Col span={4}></Grid.Col>
              <Grid.Col span={8} className="text-right">
                <Button color="gray" onClick={() => closeModal()} className="mr-1">
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </Grid.Col>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    );
  },
  onClose: () => {},
});
