import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { tabName } from '@/app/api/public-cloud/aws-roles/helpers';
import Search from '@/components/assets/search.svg';
import AddUserButton from '@/components/buttons/AddUserButton';
import PublicUsersTabs from '@/components/tabs/PublicUsersTabs';
import { useDebounce } from '@/utils/hooks';

export default function UserAWSRolesTableTop({
  title,
  subtitle,
  description,
  setOpenAddUser,
  roles,
}: {
  title: string;
  subtitle: string;
  description: string;
  setOpenAddUser: React.Dispatch<React.SetStateAction<boolean>>;
  roles: tabName[];
}) {
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedValue = useDebounce<string>(searchTerm, 450);
  const searchParams = useSearchParams()!;
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, replace, pathname],
  );

  useEffect(() => {
    if (debouncedValue == '') {
      // Remove search param
      const params = new URLSearchParams(searchParams?.toString());
      params.delete('search');
      replace(`${pathname}?${params.toString()}`);
    } else {
      handleSearch(debouncedValue);
    }
  }, [searchParams, replace, pathname, debouncedValue, handleSearch]);

  return (
    <div className="mx-auto w-full pt-6">
      <h1 className="px-4  text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-14">
        {title}
      </h1>
      <div className="sm:flex sm:items-center pb-5 border-b-2 pl-4 pr-24 ">
        <div className="sm:flex-auto ">
          <h1 className="text-lg font-bold leading-6 text-gray-900">{subtitle}</h1>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <AddUserButton setOpenAddUser={setOpenAddUser} />
      </div>
      <div className="flex">
        <PublicUsersTabs roles={roles} />
        <div className="flex  items-center relative pr-4 ml-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Image
              alt="Search"
              src={Search}
              width={15}
              height={15}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
          <input
            type="text"
            id="simple-search"
            className="w-full h-9 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block pl-9 p-1.5 dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300"
            placeholder="Search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setSearchTerm(e.target.value)}
            spellCheck={false}
          />
          {isPending && (
            <div className="absolute inset-y-0 right-0 mr-4 flex items-center pl-3 pointer-events-none">
              <span className=" border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-t-slate-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
