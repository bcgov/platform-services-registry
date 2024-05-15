import { useFormContext } from 'react-hook-form';
import MailLink from '@/components/generic/button/MailLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { AGMinistries } from '@/constants';

export default function AGMinistryCheckBox({ disabled }: { disabled?: boolean }) {
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
        Management BC and BC Housing must engage with <MailLink to="JAGMISO@gov.bc.ca">AG Security</MailLink> to prior
        to submitting a request for a product.
      </span>
    </FormCheckbox>
  );
}
