import classNames from 'classnames';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import SecondTechLeadButton from '@/components/buttons/SecondTechLeadButton';
import AsyncAutocomplete from '@/components/form/AsyncAutocomplete';
import AlertBox from '@/components/modal/AlertBox';

const getErrorMessage = (error: any): string | undefined => {
  if (error?.message) {
    return error.message;
  }
  return undefined;
};

export default function TeamContacts({
  disabled,
  secondTechLead,
  secondTechLeadOnClick,
}: {
  disabled?: boolean;
  secondTechLead: boolean;
  secondTechLeadOnClick: () => void;
}) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [isAlertBoxOpen, setIsAlertBoxOpen] = useState(false);

  const handleSecondTechLeadClick = () => {
    if (secondTechLead) {
      setIsAlertBoxOpen(true);
    } else {
      secondTechLeadOnClick();
    }
  };

  const handleConfirmModal = () => {
    secondTechLeadOnClick();
    setIsAlertBoxOpen(false);
  };

  const handleCancelModal = () => {
    setIsAlertBoxOpen(false);
  };

  const phoneNumber = watch('supportPhoneNumber') || '';

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[()\s-]/g, '');
    setValue('supportPhoneNumber', numericValue || null);
  };

  return (
    <div className="">
      <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900">3. Team Contacts</h2>

      <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-24 gap-y-8">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">Product Owner (PO)</h3>
            <p className="mt-4 text-base leading-6 text-gray-600">
              Tell us about the Product Owner (PO). This is typically the business owner of the application. We will use
              this information to contact them with any non-technical questions. Please use only IDIR linked email
              address below.
            </p>
          </div>
          <AsyncAutocomplete
            disabled={disabled}
            name="projectOwner"
            className="mt-8"
            label="Product Owner Email"
            placeHolder="Search product owner's IDIR email address"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">Technical Lead (TL)</h3>
            <p className="mt-4 text-base leading-6 text-gray-600">
              This is typically the DevOps specialist. We use this information to contact them with technical questions
              or notify them about platform events. You require a Primary Technical Lead, a Secondary Technical Lead is
              optional. Please use only IDIR linked email address below.
            </p>
          </div>
          <AsyncAutocomplete
            disabled={disabled}
            name="primaryTechnicalLead"
            className="mt-8"
            label="Technical Lead Email"
            placeHolder="Search technical lead's IDIR email address"
          />
        </div>

        <AlertBox
          isOpen={isAlertBoxOpen}
          title="Confirm Removal of Secondary Technical Lead"
          message="Are you sure you want to remove the secondary technical lead from this product?"
          onConfirm={handleConfirmModal}
          onCancel={handleCancelModal}
          confirmButtonText="CONFIRM REMOVAL"
          cancelButtonText="CANCEL"
        />

        <div className="mt-6 flex flex-col justify-between">
          {!disabled && <SecondTechLeadButton clicked={secondTechLead} onClick={handleSecondTechLeadClick} />}
          {secondTechLead ? (
            <div className="mt-6">
              <div>
                <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">Technical Lead (TL)</h3>
                <p className="mt-4 text-base leading-6 text-gray-600">
                  This is typically the DevOps specialist. We use this information to contact them with technical
                  questions or notify them about platform events. You require a Primary Technical Lead, a Secondary
                  Technical Lead is optional. Please use only IDIR linked email address below.
                </p>
              </div>
              <AsyncAutocomplete
                disabled={disabled}
                name="secondaryTechnicalLead"
                className="mt-8"
                label="Technical Lead Email"
                placeHolder="Search secondary technical lead's IDIR email address"
              />
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex flex-col flex-start">
          <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
            After-Hours Support Contact (optional)
          </h3>
          <p className="my-4 text-base leading-6 text-gray-600">
            For Business Mission Critical Applications Only. You can specify a phone number of your team member who
            should be contacted by the BC Government&apos;s Service Desk (7-7000) if an issue is reported for your
            product outside of business hours
          </p>
          <IMaskInput
            className="w-fit"
            mask="+1 (000) 000-0000"
            unmask={true}
            value={phoneNumber}
            onAccept={handlePhoneNumberChange}
            placeholder="+1 (999) 999-9999"
          />
          <p
            className={classNames(
              errors.supportPhoneNumber ? 'text-red-400' : '',
              'mt-3 text-sm leading-6 text-gray-600',
            )}
          >
            {getErrorMessage(errors.supportPhoneNumber)}
          </p>
        </div>
      </div>
    </div>
  );
}
