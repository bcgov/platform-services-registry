import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSnapshot } from 'valtio';
import MailLink from '@/components/generic/button/MailLink';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { appState } from '@/states/global';

export default function AGMinistryCheckBox({ disabled }: { disabled?: boolean }) {
  const appSnapshot = useSnapshot(appState);
  const { watch, register, formState, setValue } = useFormContext();
  const _organizationId = watch('organizationId');

  const isAgMinistry = useMemo(() => {
    let isAG = false;

    if (_organizationId) {
      const organization = appSnapshot.info.ORGANIZATIONS.find((org) => org.id === _organizationId);
      if (organization) {
        isAG = organization.isAgMinistry;
      }
    }

    setValue('isAgMinistry', isAG);
    return isAG;
  }, [appSnapshot, _organizationId, setValue]);

  if (!isAgMinistry) {
    return null;
  }

  return (
    <FormCheckbox
      id="ag-security"
      inputProps={register('isAgMinistryChecked')}
      disabled={disabled}
      className={{ label: 'text-sm' }}
    >
      <span className={`${formState.errors.isAgMinistryChecked && 'text-red-400'}`}>
        * All product teams from the Ministries of Attorney General, Public Safety and Solicitor General and Ministry of
        Emergency Management and Climate Readiness (EMCR) must engage with{' '}
        <MailLink to="JAGMISO@gov.bc.ca">AG Security</MailLink> to prior to submitting a request for a product.
      </span>
    </FormCheckbox>
  );
}
