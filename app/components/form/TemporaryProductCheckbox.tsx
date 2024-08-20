import { Alert } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';

export default function TemporaryProductCheckbox({ disabled }: { disabled?: boolean }) {
  const { register } = useFormContext();

  return (
    <Alert variant="light" color="blue" title="Temporary product set">
      <FormCheckbox
        id="isTest"
        inputProps={register('isTest')}
        disabled={disabled}
        className={{ label: 'text-lg', input: 'ml-1' }}
        showConfirm
        confirmCheckedTitle="Are you sure you want a temporary product set?"
        confirmUncheckedTitle="Are you sure you want to make a temporary product set permanent?"
        confirmCheckedMessage="You have selected a temporary product set. Please be aware that everything in the provisioned namespaces will be deleted after 30 days, including all data and deployments."
        confirmUncheckedMessage="You have unchecked a temporary product set. Please be aware that product set will NOT be deleted after 30 days."
      >
        This product set will be automatically deleted after 30 days.
      </FormCheckbox>
    </Alert>
  );
}
