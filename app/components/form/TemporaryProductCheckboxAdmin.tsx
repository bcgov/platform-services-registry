import { Alert } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { updatePrivateCloudProductAdmin } from '@/services/backend/admin';
import { usePrivateProductState } from '@/states/global';

export default function TemporaryProductCheckboxAdmin({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  const [privateState, privateSnap] = usePrivateProductState();
  const { register, watch, formState, resetField, setValue } = useFormContext();
  const isTest = watch('isTest');

  const {
    mutateAsync: updateFlag,
    isPending: isUpdatingFlag,
    isError: isUpdateFlagError,
    error: updateFlagError,
  } = useMutation({
    mutationFn: (isTemporary: boolean) =>
      updatePrivateCloudProductAdmin(privateSnap.licencePlate, { isTest: isTemporary }),
    onSuccess: async (prod) => {
      privateState.currentProduct = prod;
      resetField('isTest', { defaultValue: prod.isTest });

      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Temporary flag updated!',
        autoClose: 5000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to update temporary flag: ${error.message}`,
        autoClose: 5000,
      });
    },
  });

  useEffect(() => {
    if (formState.dirtyFields.isTest) {
      updateFlag(isTest);
    }
  }, [formState.dirtyFields.isTest]);

  return (
    <Alert variant="light" color="blue" title="Temporary product set" className={classNames(className)}>
      <FormCheckbox
        id="isTest"
        inputProps={register('isTest')}
        disabled={disabled}
        className={{ label: 'text-lg', input: 'ml-1' }}
        showConfirm
        confirmCheckedTitle="Are you sure you want to set this product as a temporary product set?"
        confirmUncheckedTitle="Are you sure you want to set this product as a permanent product set?"
        confirmCheckedMessage="You have selected a temporary product set. Please be aware that everything in the provisioned namespaces will be deleted after 30 days, including all data and deployments."
        confirmUncheckedMessage="You have unchecked a temporary product set. Please be aware that product set will NOT be deleted after 30 days."
      >
        This product set will be automatically deleted after 30 days.
      </FormCheckbox>
    </Alert>
  );
}
