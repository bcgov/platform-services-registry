import { useFormContext } from 'react-hook-form';
import classNames from '@/components/utils/classnames';
import { useRouter } from 'next/navigation';
import { clusters, ministries } from '@/constants';

export default function ProjectDescription({
  disabled,
  clusterDisabled,
}: {
  disabled?: boolean;
  clusterDisabled?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const router = useRouter();

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-20">
        Private Cloud OpenShift Platform - Project Set Provisioning Request
      </h1>
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        1. Product Description
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        If this is your first time on the <b>OpenShift platform</b> you need to book an alignment meeting with the
        Platform Services team. Reach out to <b>Faisal Hamood</b> to get started.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
            Product Name
          </label>
          <div className="mt-2">
            <input
              disabled={disabled}
              type="text"
              placeholder="Enter product name"
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
              {...register('name')}
            />
          </div>
          <p className={classNames(errors.name ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Please provide a descriptibe product name with no acronyms
          </p>
        </div>

        <div className="col-span-full">
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              disabled={disabled}
              id="about"
              placeholder="Enter a description..."
              {...register('description')}
              rows={3}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )} // defaultValue={""}
            />
          </div>
          <p className={classNames(errors.description ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Tell us more about your product
          </p>
        </div>
        <div className="sm:col-span-3 sm:mr-10">
          <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
            Ministry
          </label>
          <div className="mt-2">
            <select
              disabled={disabled}
              id="ministry"
              {...register('ministry')}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            >
              <option value="">Select Ministry</option>
              {ministries.map((ministry) => (
                <option key={ministry} value={ministry}>
                  {ministry}
                </option>
              ))}
            </select>

            <p className={classNames(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Select the government ministry that this product belongs to
            </p>
          </div>
        </div>

        <div className="sm:col-span-3 sm:ml-10">
          <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
            Cluster
          </label>
          <div className="mt-2">
            <select
              disabled={disabled || clusterDisabled}
              {...register('cluster')}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled || clusterDisabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            >
              <option value="">Select Cluster</option>
              {clusters.map((cluster) => (
                <option key={cluster} value={cluster}>
                  {cluster}
                </option>
              ))}
            </select>
            <p className={classNames(errors.cluster ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Select your cluster Select CLAB or KLAB for testing purposes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
