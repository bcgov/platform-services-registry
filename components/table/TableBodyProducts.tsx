/* eslint-disable jsx-a11y/aria-role */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import path from 'path';
import Image from 'next/image';
import Empty from '@/components/assets/empty.svg';
import Link from 'next/link';
import classNames from '@/utils/classnames';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/table/Avatar';
import { copyToClipboard } from '@/utils/copy-to-clipboard';
import { showTooltip } from '@/utils/show-tooltip';
import React, { useState } from 'react';
import Avatars from './Avatars';

interface TableProps {
  rows: Record<string, any>[];
  isLoading: boolean;
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
      <span className="font-bcsans text-xl font-bold text-mediumgrey mt-4">There are no products to be displayed</span>
      <Link
        className=" underline font-bcsans text-lg font-extralight text-linkblue mt-4"
        href={`/${pathname.split('/')[1]}/products/create`}
      >
        REQUEST A NEW PRODUCT
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

  return 'Updated at';
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
    return (
      <div className="flex items-center">
        <svg fill="#003366" className="h-3.5 w-3.5 mr-1" focusable="false" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M16 22c1.1 0 2-.9 2-2l-.01-3.18c0-.53-.21-1.03-.58-1.41L14 12l3.41-3.43c.37-.37.58-.88.58-1.41L18 4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3.16c0 .53.21 1.04.58 1.42L10 12l-3.41 3.4c-.38.38-.59.89-.59 1.42V20c0 1.1.9 2 2 2h8zM8 7.09V5c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v2.09c0 .27-.11.52-.29.71L12 11.5 8.29 7.79c-.18-.18-.29-.44-.29-.7z"></path>
        </svg>
        Reviewing
      </div>
    );
  }

  if (requestDecisionStatus === 'REJECTED') {
    return 'Rejected';
  }

  return '';
}

export default function TableBody({ rows, isLoading = false }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cloud = pathname.split('/')[1];
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const handleCopyToClipboard = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
    licencePlateToCopy: string,
    index: number,
  ) => {
    event.stopPropagation(); // Stop event propagation to prevent onRowClickHandler from firing
    copyToClipboard(licencePlateToCopy);
    showTooltip(setTooltipVisible);
    setTooltipIndex(index);
  };

  if (isLoading) {
    return null;
  }

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    router.push(path.join(`/${cloud}/products/${row.licencePlate}/${row.requests.length > 0 ? 'decision' : 'edit'}`));
  };

  return (
    <main className="">
      <ul className="divide-y divide-grey-200/5 ">
        {rows.map((deployment, index) => (
          <li key={deployment.id}>
            <div
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' && onRowClickHandler(deployment)}
              role="button" // Assign an appropriate role
              onClick={() => onRowClickHandler(deployment)}
              className="hover:bg-gray-100 transition-colors duration-200 relative flex justify-between items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8 "
            >
              <div className="flex justify-between w-full">
                <div className="min-w-[300px] lg:w-[365px]">
                  <div className="flex items-center gap-x-3">
                    {/* <div className={classNames(circleColor(deployment.requestType), 'flex-none rounded-full p-1')}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div> */}
                    <h2 className="min-w-0 text-base text-gray-700">
                      <div className="flex gap-x-2">
                        <span className="">
                          <span className="font-semibold leading-6"> {deployment.cluster}</span>{' '}
                          <span className="text-gray-400">/</span>{' '}
                          <span className="">{truncateText(deployment.name, 100)}</span>
                          {deployment.status !== 'ACTIVE' && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded no-underline ml-1">
                              Inactive
                            </span>
                          )}
                        </span>
                      </div>
                    </h2>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-sm leading-5 text-gray-400">
                    <div className="whitespace-nowrap">Ministry {deployment.ministry}</div>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-400">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p className="whitespace-nowrap">
                      {createdText(deployment.requestType, deployment.requestDecisionStatus)} {deployment.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-1 w-full min-w-20 ml-10 mr-3">
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
                <div className="flex mt-1.5 space-x-2 w-3/5 justify-start min-w-0 xl:min-w-[450px] mr-10">
                  {/* <div className="flex w-fit justify-start border"> */}
                  <div className="hidden md:flex flex-col gap-2 xl:flex-row">
                    <Avatar
                      className="min-w-52"
                      name={deployment.projectOwner.name}
                      email={deployment.projectOwner.email}
                      userRole={'Product Owner'}
                    />
                    <div className="flex flex-col space-y-4">
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
                    {/* </div> */}
                  </div>
                  {/* <div className="md:hidden flex">
                    <Avatars
                      productOwnerEmail={deployment.projectOwner.email}
                      primaryTechnicalLeadEmail={deployment.primaryTechnicalLead.email}
                      secondaryTechnicalLeadEmail={deployment?.secondaryTechnicalLead?.email}
                    />
                  </div> */}
                </div>
              </div>

              <div className="flex">
                <div className="text-gray-700 w-15">{deployment.licencePlate}</div>
                <DocumentDuplicateIcon
                  className="h-5 w-5 flex-none text-gray-400 cursor-pointer"
                  aria-hidden="true"
                  onClick={(event) => handleCopyToClipboard(event, deployment.licencePlate, index)}
                />
                {tooltipVisible && tooltipIndex === index && (
                  <div className="absolute opacity-70 top-0 right-0 z-50 bg-white text-gray-600 py-1 px-2 rounded-lg text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                    Copied
                  </div>
                )}
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
