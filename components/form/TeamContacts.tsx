import AsyncAutocomplete from '@/components/form/AsyncAutocomplete';
import SecondTechLeadButton from '@/components/buttons/SecondTechLeadButton';

export default function TeamContacts({
  disabled,
  secondTechLead,
  secondTechLeadOnClick,
}: {
  disabled?: boolean;
  secondTechLead: boolean;
  secondTechLeadOnClick: () => void;
}) {
  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        2. Team Contacts
      </h2>

      <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-24 gap-y-8">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
              Product Owner (PO)
            </h3>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
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
            <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
              Technical Lead (TL)
            </h3>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
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

        <div className="mt-6 flex flex-col justify-between sm:col-start-2">
          <SecondTechLeadButton clicked={secondTechLead} onClick={secondTechLeadOnClick} />

          {secondTechLead ? (
            <div className="mt-6">
              <div>
                <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
                  Technical Lead (TL)
                </h3>
                <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
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
      </div>
    </div>
  );
}
