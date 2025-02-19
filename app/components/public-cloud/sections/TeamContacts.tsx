import React from 'react';
import { useFormContext } from 'react-hook-form';
import SecondTechLeadButton from '@/components/buttons/SecondTechLeadButton';
import AsyncAutocomplete from '@/components/form/AsyncAutocomplete';
import { openConfirmModal } from '@/components/modal/confirm';

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
  const handleSecondTechLeadClick = async () => {
    if (secondTechLead) {
      const res = await openConfirmModal({
        content: 'Are you sure you want to remove the secondary technical lead from this product?',
      });
      if (res?.state.confirmed) {
        secondTechLeadOnClick();
      }
    } else {
      secondTechLeadOnClick();
    }
  };

  return (
    <div className="">
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
            label="Product Owner email"
            placeHolder="Search product owner's IDIR email address"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">Technical Lead (TL)</h3>
            <p className="mt-4 text-base leading-6 text-gray-600">
              This is typically the DevOps specialist. We use this information to contact them with technical questions
              or notify them about platform events. You require a Primary Technical Lead, a Secondary Technical Lead is
              optional. Please use only IDIR linked email address below. <br />
              <span className="text-gray-600">
                Kindly make sure the Product Owner&#40;PO&#41; and the Primary Technical Lead &#40;TL&#41; are{' '}
                <span className="text-red-600">NOT</span> the same person.
              </span>
            </p>
          </div>
          <AsyncAutocomplete
            disabled={disabled}
            name="primaryTechnicalLead"
            className="mt-8"
            label="Technical Lead email"
            placeHolder="Search technical lead's IDIR email address"
          />
        </div>
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
                label="Technical Lead email"
                placeHolder="Search secondary technical lead's IDIR email address"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
