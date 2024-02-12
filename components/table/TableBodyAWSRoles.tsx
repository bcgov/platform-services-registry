'use client';

import Delete from '@/components/assets/delete.svg';
import Image from 'next/image';
import React from 'react';
import { User } from '@/app/api/public-cloud/aws-roles/helpers';

const rowValue = (value: string, header: string, index: number): React.ReactNode => {
  return (
    <td
      key={value + header}
      className={`font-sans font-normal text-base px-3 py-4 text-mediumgrey md:table-cell border-b-1 ${
        index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : ''
      } `}
    >
      {header === 'email' ? (
        <a href={`mailto:${value}`} className="text-blue-500 hover:text-blue-700">
          {value}
        </a>
      ) : (
        value
      )}
    </td>
  );
};

const headers = [
  { field: 'role', headerName: 'Role' },
  { field: 'firstName', headerName: 'First Name' },
  { field: 'lastName', headerName: 'Last Name' },
  { field: 'email', headerName: 'Email' },
  { field: 'delete', headerName: '' },
];

interface TableProps {
  rows: Record<string, any>[];
  userRole: string;
  setOpenDeleteUser: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletePerson: React.Dispatch<React.SetStateAction<User>>;
}

export default function TableBodyAWSRoles({ rows, userRole, setOpenDeleteUser, setDeletePerson }: TableProps) {
  const onDeleteClickHandler = (row: any) => {
    setDeletePerson(row);
    setOpenDeleteUser(true);
  };

  const subHeader = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
    { field: 'email', headerName: 'Email' },
  ];

  return (
    <div className="flow-root overflow-y-auto h-[50vh]">
      <div className="w-full overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full text-left">
            <thead className="bg-tableheadergrey border-b-1">
              <tr>
                {headers.map(({ headerName }, index) => (
                  <th
                    key={headerName + index}
                    scope="col"
                    className={`font-sans relative isolate py-3.5 text-left text-base font-semibold text-mediumgrey md:w-auto ${
                      index === 0 ? 'pl-4 sm:pl-6 lg:pl-8' : 'px-3'
                    } ${index === headers.length - 1 ? 'pr-4 sm:pr-6 lg:pr-8' : ''}`}
                  >
                    {headerName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="hover:bg-tableheadergrey">
                  <td
                    key={row.id + i}
                    className={`font-sans font-normal text-base pl-4 sm:pl-6 lg:pl-8 py-4 text-mediumgrey md:table-cell border-b-1`}
                  >
                    {userRole}
                  </td>
                  {subHeader.map((value, index) => rowValue(row[value.field], value.field, index))}
                  <td
                    key={row.id}
                    className={`font-sans font-normal text-base pl-4 sm:pl-6 lg:pl-8 py-4 text-mediumgrey md:table-cell border-b-1`}
                  >
                    <Image
                      alt="Delete"
                      src={Delete}
                      width={20}
                      height={20}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                      className="hover:cursor-pointer"
                      onClick={() => onDeleteClickHandler(row)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
