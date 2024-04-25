import { useFormContext } from 'react-hook-form';
import { AGMinistries } from '@/constants';

export default function AGMinistryCheckBox({ disabled }: { disabled?: boolean }) {
  const { watch, register, formState } = useFormContext();
  const watchMinistry = watch('ministry');

  if (!AGMinistries.includes(watchMinistry)) {
    return null;
  }

  return (
    <div className="flex items-center">
      <label
        htmlFor="ag-security"
        className={`${formState.errors.isAgMinistryChecked && 'text-red-400'} mt-3 text-sm leading-6 flex select-none`}
      >
        <input
          disabled={disabled}
          id="ag-security"
          type="checkbox"
          className="mr-3 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
          {...register('isAgMinistryChecked')}
        />
        <span>
          * All product teams from the Ministries of Attorney General, Public Safety and Solicitor General and Emergency
          Management BC and BC Housing must engage with
          <a href="mailto: JAGMISO@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
            {' '}
            AG Security{' '}
          </a>
          to prior to submitting a request for a product.
        </span>
      </label>
    </div>
  );
}
