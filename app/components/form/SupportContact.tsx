import { useFormContext } from 'react-hook-form';
import { IMaskInput } from 'react-imask';

const getErrorMessage = (error: any): string | undefined => {
  if (error?.message) {
    return error.message;
  }
  return undefined;
};

export default function SupportContact() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const phoneNumber = watch('supportPhoneNumber') || '';

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[()\s-]/g, '');
    setValue('supportPhoneNumber', numericValue || null);
  };

  return (
    <div className="mt-6 flex flex-col flex-start">
      <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
        After-Hours support contact (optional)
      </h3>
      <p className="my-4 text-base leading-6 text-gray-600">
        For Business Mission Critical Applications Only. You can specify a phone number of your team member who should
        be contacted by the BC Government&apos;s Service Desk (7-7000) if an issue is reported for your product outside
        of business hours
      </p>
      <IMaskInput
        className="w-fit"
        mask="+1 (000) 000-0000"
        unmask={true}
        value={phoneNumber}
        onAccept={handlePhoneNumberChange}
        placeholder="+1 (999) 999-9999"
      />
      <p className="mt-3 text-sm leading-6 text-gray-600">{getErrorMessage(errors.supportPhoneNumber)}</p>
    </div>
  );
}
