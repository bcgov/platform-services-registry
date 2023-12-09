/* eslint-disable jsx-a11y/aria-role */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import path from 'path';
import Image from 'next/image';
import Empty from '@/components/assets/empty.svg';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import classNames from '@/components/utils/classnames';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Avatar from '@/components/table/Avatar';
import Avatars from '@/components/table/Avatars';
import { de } from '@faker-js/faker';

interface TableProps {
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

const circleStatus = {
  blue: 'text-blue-400 bg-blue-400/10',
  grey: 'text-gray-400 bg-gray-400/10',
  red: 'text-rose-400 bg-rose-400/10',
  green: 'text-green-400 bg-green-400/10',
};

const requestTypes = {
  CREATE: 'text-gray-400 bg-green-400/10 ring-green-400/20',
  EDIT: 'text-indigo-400 bg-indigo-400/10 ring-indigo-400/30',
  DELETE: 'text-red-400 bg-red-400/10 ring-red-400/20',
};

function circleColor(requestType: string) {
  if (requestType === 'CREATE') {
    return circleStatus.blue;
  }

  if (requestType === 'EDIT') {
    return circleStatus.blue;
  }

  if (requestType === 'DELETE') {
    return circleStatus.red;
  }

  return circleStatus.green;
}

function deploymentText(requestType: string, requestDecisionStatus?: string) {
  if (requestDecisionStatus === 'APPROVED') {
    return 'Provisioning on';
  }

  if (requestType === 'CREATE') {
    return 'Pending deployment on';
  }

  if (requestType === 'EDIT') {
    return 'Requested changes on';
  }

  if (requestType === 'DELETE') {
    return 'Requested deletion on';
  }

  return 'Deployed on';
}

export default function TableBody({ rows }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.roles?.includes('admin');

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    switch (pathname) {
      case '/private-cloud/products/all' || '/private-cloud/products/active-requests':
        if (isAdmin) {
          if (row.requestType === 'CREATE' || row.requestType === 'EDIT' || row.requestType === 'DELETE') {
            router.push(path.join('/private-cloud', 'decision', row.licencePlateValue));
            break;
          }
        }

        if (row.requestType === 'CREATE' || row.requestType === 'EDIT' || row.requestType === 'DELETE') {
          router.push(path.join('/private-cloud', 'request', row.id));
          break;
        }

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

        console.log('END');
    }
  };

  return (
    <main className="">
      <ul className="divide-y divide-grey-200/5 overflow-auto">
        {rows.map((deployment) => (
          <li key={deployment.id}>
            <div
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' && onRowClickHandler(deployment)}
              role="button" // Assign an appropriate role
              onClick={() => onRowClickHandler(deployment)}
              className="hover:bg-gray-100 transition-colors duration-200 relative flex justify-between items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 "
            >
              <div className="flex ">
                <div className="w-[500px] 2xl:w-[600px]">
                  <div className="flex items-center gap-x-3">
                    <div className={classNames(circleColor(deployment.requestType), 'flex-none rounded-full p-1')}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <h2 className="min-w-0 text-base font-semibold leading-6 text-gray-700">
                      <div className="flex gap-x-2">
                        <span className="">{deployment.cluster}</span>
                        <span className="text-gray-400">/</span>
                        <span className="truncate">{deployment.name}</span>
                        <span className="absolute inset-0" />
                      </div>
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-sm leading-5 text-gray-400">
                    <p className="truncate">Ministry {deployment.ministry}</p>
                    <svg viewBox="0 0 2 2" className="h-1 w-1 flex-none fill-gray-300">
                      <circle cx={1} cy={1} r={0.7} />
                    </svg>
                    <p className="whitespace-nowrap">Created on {deployment.created}</p>
                  </div>
                </div>
                <div className="mt-1 w-28">
                  <div
                    hidden={!deployment.requestType}
                    className={classNames(
                      requestTypes[deployment.requestType as keyof typeof requestTypes],
                      'rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset mr-4',
                    )}
                  >
                    {typeof deployment?.requestType === 'string' ? deployment?.requestType.toLowerCase() : null} request
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden items-center gap-x-3 w-[400px] 3xl:flex">
                  <Avatar
                    name={deployment.projectOwner.name}
                    email={deployment.projectOwner.email}
                    userRole={'Product Owner'}
                  />
                  <Avatar
                    name={deployment.primaryTechnicalLead.name}
                    email={deployment.primaryTechnicalLead.email}
                    userRole="Technical Lead"
                  />
                  {deployment?.secondaryTechnicalLead ? (
                    <Avatar
                      name={deployment.secondaryTechnicalLead?.name}
                      email={deployment.primaryTechnicalLead?.email}
                      userRole="Technical Lead"
                    />
                  ) : null}
                </div>
                <div className="3xl:hidden flex">
                  <Avatars
                    productOwnerEmail={deployment.projectOwner.email}
                    primaryTechnicalLeadEmail={deployment.primaryTechnicalLead.email}
                    secondaryTechnicalLeadEmail={deployment?.secondaryTechnicalLead?.email}
                  />
                </div>
              </div>
              <div className="flex">
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
