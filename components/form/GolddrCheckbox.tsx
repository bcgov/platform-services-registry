import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { $Enums } from '@prisma/client';

export default function GolddrCheckbox({ disabled }: { disabled?: boolean }) {
  const { watch, register, formState } = useFormContext();
  const watchCluster = watch('cluster');

  if (watchCluster !== $Enums.Cluster.GOLD) {
    return null;
  }

  return (
    <FormCheckbox
      id="golddrEnabled"
      inputProps={register('golddrEnabled')}
      disabled={disabled}
      className={{ label: 'text-sm' }}
      showConfirm
    >
      <span>
        Please choose whether you&#39;d like to include the{' '}
        <span className="font-bold text-blue-600">Golddr cluster</span> alongside the Gold cluster.
      </span>
    </FormCheckbox>
  );
}
