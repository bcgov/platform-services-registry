import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import GolddrCheckbox from '@/components/form/GolddrCheckbox';
import TemporaryProductCheckbox from '@/components/form/TemporaryProductCheckbox';
import TemporaryProductCheckboxAdmin from '@/components/form/TemporaryProductCheckboxAdmin';
import ExternalLink from '@/components/generic/button/ExternalLink';
import MailLink from '@/components/generic/button/MailLink';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import FormSelect from '@/components/generic/select/FormSelect';
import HookFormSingleSelect from '@/components/generic/select/HookFormSingleSelect';
import { clusters, ministryOptions, privateCloudTeamEmail } from '@/constants';
import { cn } from '@/utils/js';
import HookFormTextInput from '../generic/input/HookFormTextInput';

export default function ProjectDescriptionPrivate({
  mode,
  disabled,
  clusterDisabled,
  canToggleTemporary = false,
}: {
  mode: string;
  disabled?: boolean;
  clusterDisabled?: boolean;
  canToggleTemporary?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [clustersList, setClustersList] = useState(clusters);

  const { data: session } = useSession({
    required: true,
  });

  useEffect(() => {
    if (session && !session?.permissions.viewAllPrivateCloudProducts) {
      setClustersList(clusters.filter((cluster) => cluster.indexOf('LAB') === -1));
    }
  }, [session, setClustersList]);

  let temporaryProduct = null;
  if (mode === 'create') {
    temporaryProduct = (
      <>
        <p className="text-base leading-6 mt-5">
          If this is your first time on the <b>OpenShift platform</b> you need to book an alignment meeting with the
          Platform Services team. Reach out to <MailLink to={privateCloudTeamEmail} /> to get started. Provisioning
          requests from new teams that have <b>not</b> had an onboarding meeting will not be approved.
        </p>
        <div className="pt-5">
          <TemporaryProductCheckbox disabled={disabled} />
        </div>
      </>
    );
  } else if (mode === 'edit' && canToggleTemporary) {
    temporaryProduct = <TemporaryProductCheckboxAdmin disabled={disabled} className="mt-2" />;
  }

  return (
    <div className="">
      {temporaryProduct}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <HookFormTextInput
          label="Product name"
          name="name"
          placeholder="Enter product name"
          disabled={disabled}
          required
          error="Please provide a descriptive product name with no acronyms"
          classNames={{ wrapper: 'col-span-full mt-2' }}
        />

        <HookFormTextarea
          label="Description"
          name="description"
          placeholder="Enter description..."
          required
          error="Tell us more about your product"
          classNames={{ wrapper: 'col-span-full' }}
          disabled={disabled}
        />

        <div className="sm:col-span-3 sm:mr-10">
          <FormSelect
            id="ministry"
            label="Ministry"
            disabled={disabled}
            options={[{ label: 'Select Ministry', value: '' }, ...ministryOptions]}
            selectProps={register('ministry')}
          />

          <p className={cn(errors.ministry ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
            Select the government ministry that this product belongs to
          </p>
          {['create', 'edit'].includes(mode) && <AGMinistryCheckBox disabled={disabled} />}
        </div>
        <div className="sm:col-span-3 sm:ml-10">
          <HookFormSingleSelect
            name="cluster"
            label="Hosting tier"
            disabled={disabled || clusterDisabled}
            data={[{ label: 'Select Hosting tier', value: '' }, ...clustersList.map((v) => ({ label: v, value: v }))]}
          />
          <p className={cn(errors.cluster ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
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
