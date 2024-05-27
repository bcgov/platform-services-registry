import classNames from 'classnames';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import GolddrCheckbox from '@/components/form/GolddrCheckbox';
import IsTestCheckBox from '@/components/form/IsTestCheckBox';
import ExternalLink from '@/components/generic/button/ExternalLink';
import MailLink from '@/components/generic/button/MailLink';
import FormSelect from '@/components/generic/select/FormSelect';
import { clusters, ministryOptions } from '@/constants';

export default function ProjectDescriptionPrivate({
  mode,
  disabled,
  clusterDisabled,
}: {
  mode: string;
  disabled?: boolean;
  clusterDisabled?: boolean;
}) {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  const [clustersList, setClustersList] = useState(clusters);

  const { data: session } = useSession({
    required: true,
  });

  useEffect(() => {
    if (session && !session?.permissions.viewAllPrivateCloudProducts) {
      setClustersList(clusters.filter((cluster) => cluster.indexOf('LAB') === -1));
    }
  }, [session]);

  return (
    <div className="">
      <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900">
        1. Product Description
      </h2>
      {mode === 'create' && (
        <p className="text-base leading-6 mt-5">
          If this is your first time on the <b>OpenShift platform</b> you need to book an alignment meeting with the
          Platform Services team. Reach out to{' '}
          <MailLink to="platformservicesteam@gov.bc.ca">PlatformServicesTeam@gov.bc.ca</MailLink> to get started.
          Provisioning requests from new teams that have <b>not</b> had an onboarding meeting will not be approved.
        </p>
      )}

      {session?.previews.testProduct && (
        <div className="pt-5">
          <IsTestCheckBox disabled={disabled} />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
            Product Name
          </label>
          <div className="mt-2">
            <input
              autoComplete="off"
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
            Please provide a descriptive product name with no acronyms
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
              )}
            />
          </div>
          <p className={classNames(errors.description ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Tell us more about your product
          </p>
        </div>
        <div className="sm:col-span-3 sm:mr-10">
          <FormSelect
            id="ministry"
            label="Ministry"
            disabled={disabled}
            options={[{ label: 'Select Ministry', value: '' }, ...ministryOptions]}
            selectProps={register('ministry')}
          />

          <p className={classNames(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Select the government ministry that this product belongs to
          </p>
          {['create', 'edit'].includes(mode) && <AGMinistryCheckBox disabled={disabled} />}
        </div>
        <div className="sm:col-span-3 sm:ml-10">
          <FormSelect
            id="cluster"
            label="Hosting Tier"
            disabled={disabled || clusterDisabled}
            options={[
              { label: 'Select Hosting Tier', value: '' },
              ...clustersList.map((v) => ({ label: v, value: v })),
            ]}
            selectProps={register('cluster')}
          />
          <p className={classNames(errors.cluster ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            {session?.isAdmin
              ? 'Select your hosting tier, select CLAB or KLAB for testing purposes. Read more about hosting tiers '
              : 'Select your hosting tier. Read more about hosting tiers '}
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/private/products-tools/hosting-tiers/">
              here
            </ExternalLink>
            .
          </p>
          <GolddrCheckbox disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
