/* eslint-disable jsx-a11y/aria-role */

'use client';

import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import Empty from '@/components/assets/empty.svg';
import CopyableButton from '@/components/generic/button/CopyableButton';
import Avatar from '@/components/table/Avatar';
import classNames from '@/utils/classnames';

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
      <span className="text-xl font-bold text-mediumgrey mt-4">There are no products to be displayed</span>
      <Link
        className=" underline text-lg font-extralight text-linkblue mt-4"
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

export default function TableBodyRequests({ rows, isLoading = false }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cloud = pathname.split('/')[1];

  if (isLoading) {
    return null;
  }

  if (rows.length === 0) {
    return <EmptyBody />;
  }

  const onRowClickHandler = (row: any) => {
    if (row.requests.length > 0) {
      router.push(path.join(`/${cloud}/requests/${row.requests[0].id}/decision`));
    } else {
      router.push(path.join(`/${cloud}/products/${row.licencePlate}/edit`));
    }
  };

  return (
    <div className="divide-y divide-grey-200/5">
      {rows.map((row, index) => (
        <div key={row.id}>
          <div
            tabIndex={0} // Make it focusable
            onKeyDown={(e) => e.key === 'Enter' && onRowClickHandler(row)}
            role="button" // Assign an appropriate role
            onClick={() => onRowClickHandler(row)}
            className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-4 sm:px-6 lg:px-8"
          >
            <div className="md:col-span-3 lg:col-span-4">
              <div className="flex items-center gap-x-3">
                <h2 className="min-w-0 text-base text-gray-700">
                  <div className="flex gap-x-2">
                    <span className="">
                      <span className="font-semibold leading-6"> {row.cluster}</span>{' '}
                      <span className="text-gray-400">/</span> <span className="">{truncateText(row.name, 100)}</span>
                      {row.status !== 'ACTIVE' && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded no-underline ml-1">
                          Inactive
                        </span>
                      )}
                    </span>
                  </div>
                </h2>
              </div>
              <div className="mt-3 flex items-center gap-x-2.5 text-sm leading-5 text-gray-400">
                <div className="whitespace-nowrap">Ministry {row.ministry}</div>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-400">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="whitespace-nowrap">
                  {createdText(row.requestType, row.requestDecisionStatus)} {row.updatedAt}
                </p>
              </div>
            </div>

            <div className="md:col-span-1 lg:col-span-2">
              <span
                className={classNames(
                  requestTypes[row.requestType as keyof typeof requestTypes],
                  'inline-flex items-center rounded-md  px-2 py-1 text-sm font-medium capitalize text-gray-700',
                )}
              >
                {typeof row?.requestType === 'string' ? row?.requestType.toLocaleLowerCase() + ' request' : null}
              </span>
              <div>
                <span
                  className={classNames(
                    'inline-flex items-center rounded-md pr-2 py-1 text-sm capitalize text-gray-700',
                  )}
                >
                  {typeof row?.requestType === 'string' ? getStatus(row?.requestDecisionStatus) : null}
                </span>
              </div>
            </div>

            <div className="lg:col-span-1 hidden lg:block"></div>

            <div className="md:col-span-1 lg:col-span-2">
              <Avatar
                className=""
                name={row.projectOwner.name}
                email={row.projectOwner.email}
                userRole="Product Owner"
              />
            </div>

            <div className="md:col-span-1 lg:col-span-2">
              <div className="flex flex-col space-y-4">
                <Avatar
                  name={row.primaryTechnicalLead.name}
                  email={row.primaryTechnicalLead.email}
                  userRole="Technical Lead"
                />
                {row?.secondaryTechnicalLead ? (
                  <Avatar
                    name={row.secondaryTechnicalLead?.name}
                    email={row.primaryTechnicalLead?.email}
                    userRole="Technical Lead"
                  />
                ) : null}
              </div>
            </div>

            <div className="md:col-span-1">
              <CopyableButton>{row.licencePlate}</CopyableButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
