import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { Cluster } from '@/prisma/client';

export default function GolddrCheckbox({ disabled }: { disabled?: boolean }) {
  const { watch, register, setValue, formState } = useFormContext();
  const watchCluster = watch('cluster');

  useEffect(() => {
    if (watchCluster !== Cluster.GOLD) {
      setValue('golddrEnabled', false);
    }
  }, [watchCluster, setValue]);

  if (watchCluster !== Cluster.GOLD) {
    return null;
  }

  return (
    <FormCheckbox
      id="golddrEnabled"
      inputProps={register('golddrEnabled')}
      disabled={disabled}
      className={{ label: 'text-sm' }}
      showConfirm
      confirmCheckedTitle="Are you sure you want to include GOLD DR ?"
      confirmUncheckedTitle="Are you sure you want to remove GOLD DR ?"
      confirmCheckedMessage="Include GOLD DR if you are ready to setup geographic failover for your application."
      confirmUncheckedMessage="Removing GOLD DR will delete anything in the current GOLD DR namespace."
    >
      <span>Include Gold DR</span>
    </FormCheckbox>
  );
}
