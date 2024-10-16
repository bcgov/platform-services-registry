import { usePathname } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import FormSelect from '@/components/generic/select/FormSelect';
import { DropdownOption } from '@/constants';

export default function QuotaInput({
  quotaName,
  nameSpace,
  selectOptions,
  disabled,
  quota,
}: {
  quotaName: 'cpu' | 'memory' | 'storage';
  nameSpace: 'production' | 'test' | 'development' | 'tools';
  licencePlate: string;
  selectOptions: DropdownOption[];
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
        options={[{ label: `Select ${quotaNameStartUpperCase}`, value: '', disabled: true }, ...selectOptions]}
        defaultValue=""
        selectProps={register(nameSpace + 'Quota.' + quotaName)}
      />
      {(errors?.[nameSpace + 'Quota'] as { [key: string]: any })?.[quotaName] && (
        <p className="text-red-400 mt-3 text-sm leading-6">
          Select the {quotaName} for the {nameSpace} namespace
        </p>
      )}
      {quota && !disabled && (
        <div>
          <p className="pt-3 text-sm leading-6 text-gray-700">
            <b>Current {quotaName}: </b>
            {selectOptions.find((opt) => opt.value === quota || opt.value === currentQuota)?.label}
          </p>
          {quota !== currentQuota && pathname.includes('decision') && (
            <p className="pt-2 text-sm leading-6 text-gray-700">
              <b>Requested {quotaName}: </b>
              {selectOptions.find((opt) => opt.value === currentQuota)?.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
