'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Divider, Grid, LoadingOverlay, Box } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import { FormProvider, useForm } from 'react-hook-form';
import { useSnapshot } from 'valtio';
import Label from '@/components/generic/Label';
import FormSelect from '@/components/generic/select/FormSelect';
import { createModal } from '@/core/modal';
import { deleteOrganization as _deleteOrganization } from '@/services/backend/organizations';
import { appState } from '@/states/global';
import { organizationDeleteBodySchema, OrganizationDeleteBody } from '@/validation-schemas/organization';

interface ModalProps {
  id: string;
  code: string;
  name: string;
  isAgMinistry: boolean;
}
interface ModalState {}

export const openDeleteModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'lg',
    title: 'Delete Organization',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ id, code, name, isAgMinistry, closeModal }) {
    const appSnapshot = useSnapshot(appState);
    const methods = useForm({
      resolver: zodResolver(organizationDeleteBodySchema),
      defaultValues: {
        fromOrganizationId: id,
      },
    });

    const { mutateAsync: deleteOrganization, isPending: isCreatingOrganization } = useMutation({
      mutationFn: ({ fromOrganizationId, toOrganizationId }: OrganizationDeleteBody) =>
        _deleteOrganization(fromOrganizationId, toOrganizationId),
    });

    const { handleSubmit, register } = methods;

    return (
      <Box pos="relative">
        <LoadingOverlay visible={isCreatingOrganization} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <FormProvider {...methods}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(async (formData) => {
              await deleteOrganization(formData);
              closeModal();
            })}
          >
            <Label htmlFor="client-secret" className="mb-0">
              Ministry to delete
            </Label>
            <div className="mb-3">
              {name} ({code})
            </div>

            <FormSelect
              id="toOrganizationId"
              label="Ministry to migrate"
              options={appSnapshot.info.ORGANIZATION_OPTIONS.filter((v) => v.value !== id)}
              selectProps={register('toOrganizationId')}
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
