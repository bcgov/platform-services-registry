import HookFormMaskInput from '@/components/generic/input/HookFormMaskInput';

export default function SupportContact({ disabled }: { disabled?: boolean }) {
  return (
    <div className="mt-6 flex flex-col flex-start text-input">
      <h3 className="text-base 2xl:text-sm font-semibold leading-7">After-Hours support contact (optional)</h3>
      <p className="my-4 text-base leading-6 text-gray-600">
        For Business Mission Critical Applications Only. You can specify a phone number of your team member who should
        be contacted by the BC Government&apos;s Service Desk (7-7000) if an issue is reported for your product outside
        of business hours
      </p>
      <HookFormMaskInput disabled={disabled} name="supportPhoneNumber" placeholder="+1 (999) 999-9999" />
    </div>
  );
}
