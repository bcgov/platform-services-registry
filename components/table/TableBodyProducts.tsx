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

interface TableProps {
  rows: Record<string, any>[];
}

function EmptyBody() {
  const pathname = usePathname();

  if (!pathname) return null;
  return (
    <div className="flex flex-col items-center justify-center py-12 mt-12">
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
        className=" underline font-bcsans text-lg font-extralight text-linkblue mt-4"
        href={`/${pathname.split('/')[1]}/create`}
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
  EDIT: 'text-grey-600 bg-indigo-300/10 ring-indigo-400/30',
  DELETE: 'text-red-400 bg-red-400/10 ring-red-400/20',
};

function circleColor(requestType: string) {
  if (requestType === 'CREATE') {
    return circleStatus.green;
  }

  if (requestType === 'EDIT') {
    return circleStatus.blue;
  }

  if (requestType === 'DELETE') {
    return circleStatus.red;
  }

  return circleStatus.grey;
}

function createdText(requestType: string, requestDecisionStatus?: string) {
  if (requestDecisionStatus === 'APPROVED') {
    return 'Last updated on';
  }

  if (requestType === 'CREATE') {
    return 'Create requested';
  }

  if (requestType === 'EDIT') {
    return 'Edit requested';
  }

  if (requestType === 'DELETE') {
    return 'Delete requested';
  }

  return 'Deployed on';
}

function truncateText(str: string, n: number) {
  return str.length > n ? str.substring(0, n - 1) + '...' : str;
}

function getStatus(requestDecisionStatus: string) {
  if (requestDecisionStatus === 'APPROVED') {
    return (
      <span className="flex">
        <div className="mr-2">
          <div className={classNames('mt-1 text-blue-400 bg-blue-400/10', 'flex-none rounded-full p-1')}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
        </div>
        Provisioning
      </span>
    );
  }

  if (requestDecisionStatus === 'PENDING') {
    return 'Reviewing';
    // <span className="flex">
    //   <div className="mr-2">
    //     <svg width="11" height="15" viewBox="0 0 11 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <path
    //         d="M10.1782 12.9962C9.90499 10.5929 8.80819 9.59671 8.00708 8.8703C7.45321 8.36613 7.1869 8.10388 7.1869 7.64722C7.1869 7.19681 7.45227 6.93957 8.00458 6.44571C8.81507 5.72149 9.925 4.7294 10.1788 2.29356C10.1991 2.08891 10.1762 1.88229 10.1116 1.68705C10.047 1.49182 9.94209 1.31232 9.80372 1.16019C9.65596 0.997684 9.47579 0.867946 9.27482 0.779332C9.07385 0.690719 8.85654 0.645196 8.63691 0.645699H1.73603C1.51609 0.645012 1.29845 0.690442 1.09715 0.779059C0.89585 0.867676 0.715365 0.997511 0.56734 1.16019C0.42939 1.31253 0.324905 1.49211 0.260623 1.68732C0.196342 1.88253 0.173692 2.08905 0.194133 2.29356C0.447001 4.72159 1.55287 5.70649 2.36023 6.42539C2.91785 6.92206 3.18603 7.18118 3.18603 7.64722C3.18603 8.1192 2.91723 8.38363 2.35773 8.88968C1.56068 9.61171 0.466693 10.6004 0.194759 12.9962C0.172679 13.1999 0.193839 13.406 0.256857 13.601C0.319874 13.796 0.423331 13.9754 0.560463 14.1277C0.708799 14.2923 0.890157 14.4237 1.09271 14.5135C1.29527 14.6033 1.51447 14.6494 1.73603 14.6487H8.63691C8.85847 14.6494 9.07767 14.6033 9.28023 14.5135C9.48278 14.4237 9.66414 14.2923 9.81247 14.1277C9.94961 13.9754 10.0531 13.796 10.1161 13.601C10.1791 13.406 10.2003 13.1999 10.1782 12.9962ZM7.91519 13.1484H2.47119C1.98359 13.1484 1.84606 12.5858 2.188 12.237C3.01568 11.398 4.68636 10.7973 4.68636 9.8352V6.647C4.68636 6.02656 3.4986 5.55302 2.76375 4.54655C2.64248 4.38057 2.65467 4.14646 2.96286 4.14646H7.42414C7.68701 4.14646 7.74359 4.3787 7.62419 4.54498C6.89997 5.55302 5.68658 6.02343 5.68658 6.647V9.8352C5.68658 10.7895 7.42789 11.3043 8.19962 12.2379C8.51063 12.6142 8.40185 13.1484 7.91519 13.1484Z"
    //         fill="black"
    //         style={{ fill: 'black', fillOpacity: 1 }}
    //       />
    //     </svg>
    //   </div>
    //   Reviewing;
    // </span>
  }

  if (requestDecisionStatus === 'REJECTED') {
    return 'Rejected';
  }

  return '';
}

export default function TableBody({ rows }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cloud = pathname.split('/')[1];

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    router.push(path.join(`/${cloud}/product/${row.licencePlateValue}`));
  };

  return (
    <main className="">
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
              <div className="flex justify-between w-full">
                <div className="w-[300px] lg:w-[550px]">
                  <div className="flex items-center gap-x-3">
                    {/* <div className={classNames(circleColor(deployment.requestType), 'flex-none rounded-full p-1')}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div> */}
                    <h2 className="min-w-0 text-base text-gray-700">
                      <div className="flex gap-x-2">
                        <span className="">
                          <span className="font-semibold leading-6"> {deployment.cluster}</span>{' '}
                          <span className="text-gray-400">/</span>{' '}
                          <span className="">{truncateText(deployment.name, 130)}</span>
                        </span>

                        <span className="absolute inset-0" />
                      </div>
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-sm leading-5 text-gray-400">
                    <p className="truncate">Ministry {deployment.ministry}</p>
                    <p className="whitespace-nowrap">
                      {createdText(deployment.requestType, deployment.requestDecisionStatus)} {deployment.created}
                    </p>
                  </div>
                </div>
                <div className="mt-1 w-32 ml-3">
                  <div>
                    <span
                      className={classNames(
                        requestTypes[deployment.requestType as keyof typeof requestTypes],
                        'inline-flex items-center rounded-md  px-2 py-1 text-sm font-medium capitalize text-gray-700',
                      )}
                    >
                      {typeof deployment?.requestType === 'string'
                        ? deployment?.requestType.toLocaleLowerCase() + ' request'
                        : null}
                    </span>
                    <div>
                      <span
                        className={classNames(
                          'pt-2 inline-flex items-center rounded-md  px-2 py-1 text-sm  capitalize text-gray-700',
                        )}
                      >
                        {typeof deployment?.requestType === 'string'
                          ? getStatus(deployment?.requestDecisionStatus)
                          : null}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex mt-1.5 space-x-2 w-2/5">
                  <div className="hidden  gap-x-2 2xl:flex">
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
                  <div className="2xl:hidden flex">
                    <Avatars
                      productOwnerEmail={deployment.projectOwner.email}
                      primaryTechnicalLeadEmail={deployment.primaryTechnicalLead.email}
                      secondaryTechnicalLeadEmail={deployment?.secondaryTechnicalLead?.email}
                    />
                  </div>
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
