/* eslint-disable jsx-a11y/aria-role */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import path from 'path';
import Image from 'next/image';
import Empty from '@/components/assets/empty.svg';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import classNames from '@/components/utils/classnames';
import { Bars3Icon, ChevronRightIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Avatar from '@/components/table/Avatar';

interface TableProps {
  headers: Record<string, string>[];
  rows: Record<string, any>[];
}

function EmptyBody() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Image
        alt="Empty"
        src={Empty}
        width={172}
        height={128}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <span className="font-bcsans text-xl font-bold text-mediumgrey mt-4">There are no requests to be displayed</span>
      <span className="font-bcsans text-lg font-extralight text-mediumgrey mt-2">
        You currently have no provisioning requests for the
      </span>
      <span className="font-bcsans text-lg font-extralight text-mediumgrey">Private Cloud Openshift Platform</span>
      <Link
        className=" underline font-bcsans text-lg font-extralight text-linkblue mt-2"
        href="/private-cloud/products"
      >
        REQUEST A NEW PROJECT SET
      </Link>
    </div>
  );
}

const requestDecisionStatuses = {
  PENDING: 'text-gray-500 bg-gray-100/10',
  APPROVED: 'text-green-400 bg-green-400/10',
  REJECTED: 'text-rose-400 bg-rose-400/10',
  PROVISIONED: 'text-green-400 bg-green-400/10',
};

const requestTypes = {
  CREATE: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
  EDIT: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
  DELETE: 'text-red-400 bg-red-400/10 ring-red-400/20',
};

function shortenString(str: string, length: number) {
  console.log(str, length);
  if (str.length > length) {
    return `${str.substring(0, length)}...`;
  }
  return str;
}

export default function TableBody({ headers, rows }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.roles?.includes('admin');

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    switch (pathname) {
      case '/private-cloud/products':
        router.push(path.join('/private-cloud', 'edit', row.licencePlateValue));
        break;
      case '/private-cloud/requests':
        if (isAdmin) {
          router.push(path.join('/private-cloud', 'decision', row.licencePlateValue));
        } else {
          router.push(path.join('/private-cloud', 'request', row.id));
        }
        break;
      case '/public-cloud/products':
        router.push(path.join('/public-cloud', 'edit', row.licencePlateValue));
        break;
      case '/public-cloud/requests':
        if (isAdmin) {
          router.push(path.join('/public-cloud', 'decision', row.licencePlateValue));
        } else {
          router.push(path.join('/public-cloud', 'request', row.id));
        }
        break;
    }
  };

  return (
    <main className="overflow-x-auto">
      <ul className="divide-y divide-grey-200/5 ">
        {rows.map((deployment) => (
          <li key={deployment.id}>
            <div
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' && onRowClickHandler(deployment)}
              role="button" // Assign an appropriate role
              onClick={() => onRowClickHandler(deployment)}
              className="hover:bg-gray-100 transition-colors duration-200 relative flex justify-between items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 "
            >
              <div className="flex justify-between">
                <div className="min-w-0 w-96">
                  <div className="flex items-center gap-x-3">
                    <div
                      className={classNames(
                        requestDecisionStatuses[
                          deployment.requestDecisionStatus as keyof typeof requestDecisionStatuses
                        ],
                        'flex-none rounded-full p-1',
                      )}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <h2 className="min-w-0 text-base font-semibold leading-6 text-gray-700">
                      <div className="flex gap-x-2">
                        <span className="">{deployment.ministry}</span>
                        <span className="text-gray-400">/</span>
                        <span className="truncate">{deployment.name.substring(0, 50)}</span>
                        <span className="absolute inset-0" />
                      </div>
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-sm leading-5 text-gray-400">
                    <p className="truncate">Deployed to {deployment.cluster}</p>
                    <svg viewBox="0 0 2 2" className="h-1 w-1 flex-none fill-gray-300">
                      <circle cx={1} cy={1} r={0.7} />
                    </svg>
                    <p className="whitespace-nowrap">Created on {deployment.created}</p>
                  </div>
                </div>
                <div className="md:flex hidden justify-start w-60 md:ml-20 ml-0">
                  <div className="gap-x-6 2xl:flex hidden">
                    <Avatar
                      name={deployment.projectOwner.name}
                      email={deployment.projectOwner.role}
                      userRole={'Product Owner'}
                    />
                    <Avatar
                      name={deployment.primaryTechnicalLead.name}
                      email={deployment.primaryTechnicalLead.email}
                      userRole="Technical Lead"
                    />
                    {deployment?.secondaryTechnicalLead && (
                      <Avatar
                        name={deployment.secondaryTechnicalLead?.name}
                        email={deployment.primaryTechnicalLead?.email}
                        userRole="Technical Lead"
                      />
                    )}
                  </div>
                  <div className="flex 2xl:hidden isolate items-center -space-x-2 overflow-hidden ml-10 mt-2">
                    <img
                      className="relative z-30 inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <img
                      className="relative z-20 inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    {deployment?.secondaryTechnicalLead && (
                      <img
                        className="relative z-10 inline-block h-8 w-8 rounded-full ring-2 ring-white"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                        alt=""
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  hidden={!deployment.requestType}
                  className={classNames(
                    requestTypes[deployment.requestType as keyof typeof requestTypes],
                    'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset',
                  )}
                >
                  {typeof deployment?.requestType === 'string' ? deployment?.requestType.toLowerCase() : null} request
                </div>
                <div className="text-gray-700 w-20">{deployment.licencePlate}</div>
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
