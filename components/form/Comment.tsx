import { useFormContext } from 'react-hook-form';
import classNames from '@/components/utils/classnames';
import { providers, ministriesNames } from '@/constants';

export default function AdminComment() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-20">
        Private Cloud OpenShift Platform
      </h1>
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        1. Product Description
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        If this is your first time on the <b>OpenShift platform</b> you need to book an alignment meeting with the
        Platform Services team. Reach out to
        {
          <a className="text-blue-600 dark:text-blue-500 hover:underline" href="mailto:platformservicesteam@gov.bc.ca">
            PlatformServicesTeam@gov.bc.ca
          </a>
        }{' '}
        to get started. Provisioning requests from new teams that have <b>not</b> had an onboarding meeting will not be
        approved.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
            Product Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Enter product name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              {...register('name')}
            />
          </div>
          <p className={classNames(errors.name ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Please provide a descriptive product name with no acronyms
          </p>
        </div>

        <div className="col-span-full">
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              id="about"
              placeholder="Enter a description..."
              {...register('description')}
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              // defaultValue={""}
            />
          </div>
          <p className={classNames(errors.description ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Tell us more about your product
          </p>
        </div>
        <div className="sm:col-span-3 mr-10">
          <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
            Ministry
          </label>
          <div className="mt-2">
            <select
              id="ministry"
              {...register('ministry')}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Select Ministry</option>
              {ministriesNames.map((ministry) => (
                <option key={ministry.id} value={ministry.name}>
                  {ministry.humanFriendlyName}
                </option>
              ))}
            </select>

            <p className={classNames(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Select the government ministry that this product belongs to
            </p>
          </div>
        </div>

        <div className="sm:col-span-3 ml-10">
          <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
            Hosting Tier
          </label>
          <div className="mt-2">
            <select
              id="cluster"
              {...register('cluster')}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="">Select Hosting Tier</option>
              <option>SILVER</option>
              <option>GOLD</option>
              <option>KLAB</option>
            </select>
            <p className={classNames(errors.cluster ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Select your hosting tier. Read more about hosting tiers{' '}
              <a
                href="https://digital.gov.bc.ca/cloud/services/private/products-tools/hosting-tiers/"
                className="text-blue-500 hover:text-blue-700"
              >
                here
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
