import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import AccountCodingInput from '@/components/form/AccountCodingInput';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import FormError from '@/components/generic/FormError';
import { getBilling } from '@/services/backend/billing';
import { cn } from '@/utils/js';

export default function AccountCoding({
  disabled,
  accountCodingInitial = '',
}: {
  accountCodingInitial?: string;
  disabled?: boolean;
}) {
  const accountCodingSeparation = useCallback(
    () => ({
      clientCode: accountCodingInitial?.slice(0, 3).toLocaleUpperCase(),
      responsibilityCentre: accountCodingInitial?.slice(3, 8).toLocaleUpperCase(),
      serviceLine: accountCodingInitial?.slice(8, 13).toLocaleUpperCase(),
      standardObjectOfExpense: accountCodingInitial?.slice(13, 17).toLocaleUpperCase(),
      projectCode: accountCodingInitial?.slice(17, 24).toLocaleUpperCase(),
    }),
    [accountCodingInitial],
  );

  const [accountCoding, setAccountCoding] = useState(accountCodingSeparation());
  const {
    formState: { errors },
    setValue,
    setError,
    register,
    watch,
  } = useFormContext();

  const values = watch();

  const {
    data: billing,
    isLoading: isBillingLoading,
    isError: isBillingError,
    error: billingError,
    refetch: refetchBillingExistence,
  } = useQuery({
    queryKey: ['billingExistence', values.accountCoding, values.provider],
    queryFn: () => {
      const code = values.accountCoding;
      if (code.length < 24) return null;
      return getBilling(code, values.provider);
    },
    enabled: !disabled,
  });

  useEffect(() => {
    setAccountCoding(accountCodingSeparation());
  }, [accountCodingInitial, accountCodingSeparation]);

  useEffect(() => {
    setValue('accountCoding', Object.values(accountCoding).join('').toLocaleUpperCase(), { shouldDirty: true });
  }, [setValue, accountCoding]);

  useEffect(() => {
    if (!billing || disabled) return;
    if (!billing.approved) {
      setError('isEaApproval', {
        type: 'manual',
        message: 'This account coding is currently undergoing an approval process.',
      });
    }
  }, [disabled, billing]);

  let billingAlert: ReactNode = null;
  if (!disabled) {
    if (billing) {
      if (billing.approved) {
        billingAlert = (
          <Alert variant="light" color="blue" title="Billing Exists" icon={<IconInfoCircle />}>
            <FormCheckbox
              id="isEaApproval"
              inputProps={register('isEaApproval')}
              disabled={disabled}
              className={{ label: 'text-sm ' }}
            >
              Our records show that your team already has a signed MoU with OCIO for {values.provider} use. This new
              product will be added to the existing MoU. A copy of the signed MoU for this product will be emailed to
              the Ministry Expense Authority.
            </FormCheckbox>
            <FormError field="isEaApproval" className="mt-1" />
          </Alert>
        );
      } else {
        billingAlert = (
          <Alert variant="light" color="danger" title="Billing Exists" icon={<IconInfoCircle />}>
            This account coding is currently undergoing an approval process.
          </Alert>
        );
      }
    } else if (values.accountCoding?.length === 24) {
      billingAlert = (
        <Alert variant="light" color="blue" title="New Billing" icon={<IconInfoCircle />}>
          No eMOU exists for this account coding. We will initiate the process by sending an email to the EA for their
          signature. After the eMOU is signed, it will be reviewed and approved, which typically takes up to 2 business
          days.
        </Alert>
      );
    }
  }

  return (
    <div className="">
      <p className="text-base leading-6 mt-5">
        Please refer to the Memorandum of Understanding (MoU) signed for this project to enter the information required
        below. Please make sure that the information entered below matches the account coding on the MoU for this
        project.{' '}
        <b>
          If the account coding is changed at any point, all charges in the current quarter will be applied to the new
          account coding.
        </b>{' '}
        The Account Coding can only contain digits and upper case letters.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-6 sm:grid-cols-2">
        <AccountCodingInput
          disabled={disabled}
          title={'Client Code'}
          name={'clientCode'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={3}
          placeholder={'Enter the client code here (e.g. 111)'}
          alphanumericRegex={/^[0-9]+$/i}
          infoText={'3 Characters, Can contain only numbers. No special characters (e.g. !@#$%^&)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Responsibility Centre (RC)'}
          name={'responsibilityCentre'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={'Enter the responsibility centre here (e.g. 22222)'}
          alphanumericRegex={/^[a-z0-9]+$/i}
          infoText={'5 Characters,  Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Service Line (SL)'}
          name={'serviceLine'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={'Enter the service line here (e.g. 33333)'}
          alphanumericRegex={/^[0-9]+$/i}
          infoText={'5 Characters, Can contain only numbers. No special characters (e.g. !@#$%^&)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Standard Object of Expense (STOB)'}
          name={'standardObjectOfExpense'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={4}
          placeholder={'Enter the STOB here (e.g. 4444)'}
          alphanumericRegex={/^[0-9]+$/i}
          infoText={'4 Characters, Can contain only numbers. No special characters (e.g. !@#$%^&)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Project Code'}
          name={'projectCode'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={7}
          placeholder={'Enter the project code here (e.g. 7777777)'}
          alphanumericRegex={/^[a-z0-9]+$/i}
          infoText={'7 Characters,  Can contain only numbers and letters. No special characters (e.g. !@#$%^&*)'}
        />
      </div>

      <div className="relative mt-6 mb-3" data-te-input-wrapper-init>
        <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          Account Coding
        </label>
        <p className="text-base leading-6 mb-2"></p>
        <p className="bg-neutral-200 block w-full rounded-md py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-4 h-9">
          {Object.values(accountCoding).filter((i) => i !== '').length > 0
            ? Object.values(accountCoding).join(' ').toLocaleUpperCase()
            : 'Value populated from Client Code+Responsibility Centre (RC)+Service Line (SL)+Standard Object of Expense (STOB)+Project Code'}
        </p>
        <p className={cn(errors.accountCoding ? 'text-red-400' : '', 'mt-1 text-sm leading-6 text-gray-600 absolute')}>
          {errors.accountCoding?.message?.toString()}
        </p>
      </div>
      {billingAlert}
    </div>
  );
}
