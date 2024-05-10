import { useFormContext } from 'react-hook-form';
import FormSelect from '@/components/generic/select/FormSelect';
import { usePathname } from 'next/navigation';

interface SelectOptions {
  [key: string]: string;
}
export default function QuotaInput({
  quotaName,
  nameSpace,
  selectOptions,
  disabled,
  quota,
}: {
  quotaName: 'cpu' | 'memory' | 'storage';
  nameSpace: 'production' | 'test' | 'development' | 'tools';
  licensePlate: string;
  selectOptions: SelectOptions;
  disabled: boolean;
  quota: string | null;
}) {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();
  const pathname = usePathname();
  // Get the current quota value
  const initialValues = getValues();
  const initialQuota = initialValues[nameSpace + 'Quota'];
  const currentQuota = initialQuota?.[quotaName];

  // Make quotaName start with uppercase letter
  const quotaNameStartUpperCase = quotaName.charAt(0).toUpperCase() + quotaName.slice(1);

  return (
    <div className="mb-4">
      <FormSelect
        id={quotaName + nameSpace}
        label={quotaName.toUpperCase()}
        disabled={disabled}
        options={[
          { label: `Select ${quotaNameStartUpperCase}`, value: '', disabled: true },
          ...Object.entries(selectOptions).map(([value, label]) => ({ label, value })),
          ...(Object.keys(selectOptions).includes(currentQuota) ? [] : [{ label: currentQuota, value: currentQuota }]),
        ]}
        defaultValue=""
        selectProps={register(nameSpace + 'Quota.' + quotaName)}
      />
      {(errors?.[nameSpace + 'Quota'] as { [key: string]: any })?.[quotaName] && (
        <p className="text-red-400 mt-3 text-sm leading-6">
          Select the {quotaName} for the {nameSpace} namespace
        </p>
      )}
      {quota ? (
        <div>
          <p className="pt-3 text-sm leading-6 text-gray-700">
            <b>Current {quotaName}: </b>
            {selectOptions[quota || currentQuota]}
          </p>
          {quota !== currentQuota && pathname.includes('decision') ? (
            <p className="pt-2 text-sm leading-6 text-gray-700">
              <b>Requested {quotaName}: </b>
              {selectOptions[currentQuota]}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
