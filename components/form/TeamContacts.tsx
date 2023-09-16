import AsyncAutocomplete from "@/components/form/AsyncAutocomplete";
import SecondTechLeadButton from "@/components/buttons/SecondTechLeadButton";

export default function TeamContacts({
  control,
  register,
  errors,
  setValue,
  setError,
  clearErrors,
  secondTechLead,
  secondTechLeadOnClick
}: {
  control: any;
  register: any;
  errors: any;
  setValue: any;
  setError: any;
  clearErrors: any;
  secondTechLead: boolean;
  secondTechLeadOnClick: () => void;
}) {
  return (
    <div>
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        2. Team Contacts
      </h2>

      <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
              Product Owner (PO)
            </h3>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
              Tell us about the Product Owner (PO). This is typically the
              business owner of the application. We will use this information to
              contact them with any non-technical questions. Please use only
              IDIR linked email address below.
            </p>
          </div>
          <AsyncAutocomplete
            name="projectOwner"
            className="mt-8"
            label="Product Owner Email"
            placeHolder="Search project owner's IDIR email address"
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
              Technical Lead (TL)
            </h3>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
              This is typically the DevOps specialist. We use this information
              to contact them with technical questions or notify them about
              platform events. You require a Primary Technical Lead, a Secondary
              Technical Lead is optional. Please use only IDIR linked email
              address below.
            </p>
          </div>
          <AsyncAutocomplete
            name="primaryTechnicalLead"
            className="mt-8"
            label="Technical Lead Email"
            placeHolder="Search project owner's IDIR email address"
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
          />
        </div>

        <div className="mt-6 flex flex-col justify-between sm:col-start-2">
          <SecondTechLeadButton
            clicked={secondTechLead}
            onClick={secondTechLeadOnClick}
          />

          {secondTechLead ? (
            <div className="mt-6">
              <div>
                <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
                  Technical Lead (TL)
                </h3>
                <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
                  This is typically the DevOps specialist. We use this
                  information to contact them with technical questions or notify
                  them about platform events. You require a Primary Technical
                  Lead, a Secondary Technical Lead is optional. Please use only
                  IDIR linked email address below.
                </p>
              </div>
              <AsyncAutocomplete
                name="secondaryTechnicalLead"
                className="mt-8"
                label="Technical Lead Email"
                placeHolder="Search project owner's IDIR email address"
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                setError={setError}
                clearErrors={clearErrors}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
