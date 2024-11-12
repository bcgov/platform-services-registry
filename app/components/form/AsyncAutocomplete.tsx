import { Combobox, Transition } from '@headlessui/react';
import { IconCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { listUsersByEmail } from '@/services/backend/msal';
import { AppUser } from '@/types/user';
import { cn } from '@/utils';
import { userSchema } from '@/validation-schemas/shared';

export default function AsyncAutocomplete({
  name,
  label,
  placeHolder,
  className,
  disabled,
}: {
  name: string;
  label: string;
  placeHolder: string;
  className?: string;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<AppUser | undefined>(undefined);
  const [query, setQuery] = useState<string>('');

  const {
    register,
    formState: { errors },
    setValue,
    setError,
    getValues,
    clearErrors,
    watch,
  } = useFormContext();

  const emailwat = watch(name + '.email');

  const {
    data: people,
    isLoading,
    error,
  } = useQuery<AppUser[], Error>({
    queryKey: ['people', query],
    queryFn: () => listUsersByEmail(query || ''),
    enabled: !!query,
  });

  const autocompleteOnChangeHandler = (user: AppUser) => {
    setSelected(user);
    setQuery(user.email);

    const { firstName, lastName, email, ministry, idir, upn } = user;

    const parsedParams = userSchema.safeParse({
      firstName,
      lastName,
      email,
      ministry,
      idir,
      upn,
    });

    if (!parsedParams.success) {
      setError('root', {
        type: 'manual',
        message:
          'The IDIR account associated with this email address is badly formatted and cannot be added as it does not contain the users name or ministry',
      });
    } else {
      clearErrors('root');
    }

    if (!idir) {
      setError('idir', {
        type: 'manual',
        message: 'Please populate your IDIR account with your IDIR',
      });
    } else {
      clearErrors('idir');
    }

    if (!upn) {
      setError('upn', {
        type: 'manual',
        message: 'Please populate your IDIR account with your User Principal Name',
      });
    } else {
      clearErrors('upn');
    }

    setValue(
      name,
      {
        firstName,
        lastName,
        email,
        ministry,
        idir,
        upn,
      },
      { shouldDirty: true },
    );
  };

  useEffect(() => {
    if (emailwat) {
      setQuery(emailwat);
    }
  }, [emailwat]);

  return (
    <div className={className}>
      <label
        htmlFor="first-name"
        className={cn(errors[name] ? 'text-red-400' : '', 'block text-sm font-medium leading-6 text-gray-900')}
      >
        {label}
      </label>
      <Combobox value={selected} onChange={autocompleteOnChangeHandler} disabled={disabled}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default rounded-lg bg-white text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            <Combobox.Input
              autoComplete="xyz"
              displayValue={(user: AppUser) => user?.email}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => {
                setQuery(getValues(name).email || '');
              }}
              placeholder={placeHolder}
              value={query}
              className={cn(
                'rounded-md border-slate-300 w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            />
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            // afterLeave={() => setQuery(null)}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Loading...</div>
              ) : error ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Error fetching data.</div>
              ) : people && people.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No IDIR linked email address found.
                </div>
              ) : (
                people &&
                people.map((user) => (
                  <Combobox.Option
                    key={user?.email}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={user}
                  >
                    {({ selected: sel, active }) => (
                      <>
                        <span className={`block truncate ${sel ? 'font-medium' : 'font-normal'}`}>{user?.email}</span>
                        {sel ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-teal-600'
                            }`}
                          >
                            <IconCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {errors.root ? <p className={'text-red-400 mt-3 text-sm leading-6'}>{String(errors.root?.message)}</p> : null}
      {errors.primaryTechnicalLead ? (
        <p className="text-red-400 mt-3 text-sm leading-6">
          The Product Owner &#40;PO&#41; and the Primary Technical Lead &#40;TL&#41; must not be the same.
        </p>
      ) : null}
      <div className="mt-8 col-span-full">
        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
          First name
        </label>
        <div className="mt-2">
          <input
            disabled
            // value={isString(selected) ? selected : selected.givenName}
            placeholder="Autofilled from IDIR"
            type="text"
            id="first-name"
            autoComplete="given-name"
            {...register(name + '.firstName')}
            className="block w-full rounded-md border-0 py-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-8 col-span-full">
        <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
          Last name
        </label>
        <div className="mt-2">
          <input
            disabled
            // value={isString(selected) ? selected : selected.surname}
            placeholder="Autofilled from IDIR"
            type="text"
            id="last-name"
            autoComplete="family-name"
            {...register(name + '.lastName')}
            className="block w-full rounded-md border-0 py-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-8 col-span-full">
        <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
          Ministry
        </label>
        <div className="mt-2">
          <input
            disabled
            placeholder="Autofilled from IDIR"
            type="text"
            id="ministry"
            autoComplete="off"
            {...register(name + '.ministry')}
            className="block w-full rounded-md border-0 py-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div className="mt-8 col-span-full">
        <label htmlFor="idir" className="block text-sm font-medium leading-6 text-gray-900">
          IDIR
        </label>
        <div className="mt-2">
          <input
            disabled
            placeholder="Autofilled from IDIR"
            type="text"
            id="idir"
            autoComplete="off"
            {...register(name + '.idir')}
            className="block w-full rounded-md border-0 py-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      {errors.idir ? <p className={'text-red-400 mt-3 text-sm leading-6'}>{String(errors.idir?.message)}</p> : null}
      <div className="mt-8 col-span-full">
        <label htmlFor="upn" className="block text-sm font-medium leading-6 text-gray-900">
          UPN
        </label>
        <div className="mt-2">
          <input
            disabled
            placeholder="Autofilled from IDIR"
            type="text"
            id="upn"
            autoComplete="off"
            {...register(name + '.upn')}
            className="block w-full rounded-md border-0 py-1.5 text-slate-400 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      {errors.upn ? <p className={'text-red-400 mt-3 text-sm leading-6'}>{String(errors.upn?.message)}</p> : null}
    </div>
  );
}
