import { useFormContext } from 'react-hook-form';
import { AGMinistries } from '@/constants';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';

export default function GolddrCheckbox({ disabled }: { disabled?: boolean }) {
  const { watch, register, formState } = useFormContext();
  const watchMinistry = watch('ministry');

  if (!AGMinistries.includes(watchMinistry)) {
    return null;
  }

  return (
    <FormCheckbox
      id="ag-security"
      inputProps={register('isAgMinistryChecked')}
      disabled={disabled}
      className={{ label: 'text-sm ' }}
    >
      <span className={`${formState.errors.isAgMinistryChecked && 'text-red-400'}`}>
        * All product teams from the Ministries of Attorney General, Public Safety and Solicitor General and Emergency
        Management BC and BC Housing must engage with
        <a href="mailto: JAGMISO@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
          {' '}
          AG Security{' '}
        </a>
        to prior to submitting a request for a product.
      </span>
    </FormCheckbox>
  );
}
