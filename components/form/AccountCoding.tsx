import { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import AccountCodingInput from '@/components/form/AccountCodingInput';
import classNames from '@/utils/classnames';

export default function AccountCoding({
  disabled,
  accountCodingInitial = '',
}: {
  accountCodingInitial?: string;
  disabled?: boolean;
}) {
  const {
    formState: { errors },
    setValue,
  } = useFormContext();

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

  useEffect(() => {
    setAccountCoding(accountCodingSeparation());
  }, [accountCodingInitial, accountCodingSeparation]);

  useEffect(() => {
    setValue('accountCoding', Object.values(accountCoding).join('').toLocaleUpperCase(), { shouldDirty: true });
  }, [setValue, accountCoding]);

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        4. Billing (Account Coding)
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
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
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Responsibility Centre (RC)'}
          name={'responsibilityCentre'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={'Enter the responsibility centre here (e.g. 22222)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Service Line (SL)'}
          name={'serviceLine'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={'Enter the service line here (e.g. 33333)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Standard Object of Expense (STOB)'}
          name={'standardObjectOfExpense'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={4}
          placeholder={'Enter the STOB here (e.g. 4444)'}
        />
        <AccountCodingInput
          disabled={disabled}
          title={'Project Code'}
          name={'projectCode'}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={7}
          placeholder={'Enter the project code here (e.g. 7777777)'}
        />
      </div>

      <div className="relative mt-6 mb-3" data-te-input-wrapper-init>
        <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          Account Coding
        </label>
        <p className="font-bcsans text-base leading-6 mb-2"></p>
        <p className="bg-neutral-200 block w-full rounded-md py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-4 h-9">
          {Object.values(accountCoding).filter((i) => i !== '').length > 0
            ? Object.values(accountCoding).join(' ').toLocaleUpperCase()
            : 'Value populated from Client Code+Responsibility Centre (RC)+Service Line (SL)+Standard Object of Expense (STOB)+Project Code'}
        </p>
        <p
          className={classNames(
            errors.accountCoding ? 'text-red-400' : '',
            'mt-1 text-sm leading-6 text-gray-600 absolute',
          )}
        >
          {errors.accountCoding?.message?.toString()}
        </p>
      </div>
    </div>
  );
}
