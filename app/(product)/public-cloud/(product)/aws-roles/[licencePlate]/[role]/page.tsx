'use client';

import TableAWSRoles from '@/components/table/TableAWSRoles';
import { User } from '@/app/api/public-cloud/aws-roles/helpers';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
import { capitalizeFirstLetter } from '@/components/utils/capitalizeFirstLetter';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';
import UserAWSRolesTableTop from '@/components/table/TableTopUserAWSRoles';
import AddUserModal from '@/components/modal/AddUser';
import { useEffect, useState } from 'react';
import DeleteUserModal from '@/components/modal/DeleteUser';
import EmptyBody from '@/components/EmptyUsersList';

async function addUser(userEmail: string, groupId: string): Promise<string | undefined> {
  const url = `/api/public-cloud/aws-roles/addUser?userEmail=${userEmail}&groupId=${groupId}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      return response.statusText;
    }
    console.error('Failed to handle PUT request:', response.statusText);
  } catch (error) {
    console.error('Error during PUT request:', error);
  }
}

async function deleteUser(userId: string, groupId: string): Promise<string | undefined> {
  const url = `/api/public-cloud/aws-roles/deleteUser?userId=${userId}&groupId=${groupId}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      return response.statusText;
    }
    console.error('Failed to handle DELETE request:', response.statusText);
  } catch (error) {
    console.error('Error during DELETE request:', error);
  }
}

const pathParamRoleToRole = (pathRole: string): string => {
  const role = capitalizeFirstLetter(pathRole.replace(/-/g, ' ').slice(0, -1));
  return role;
};

async function GetUsersPaginatedList(
  licencePlate: string,
  role: string,
  currentPage: string,
  pageSize: string,
): Promise<any> {
  const res = await fetch(
    `/api/public-cloud/aws-roles/getUsersList?licencePlate=${licencePlate}&role=${role}&page=${currentPage}&pageSize=${pageSize}`,
  );
  if (!res.ok) {
    throw new Error('Network response was not ok for fetch user image');
  }
  const data = await res.json();
  return data;
}

export default function ProductAWSRoles() {
  let rows: Record<string, User>[] = [];
  const searchParams = useSearchParams();
  const params = useParams();
  const licencePlate = params.licencePlate as string;
  const userRole = pathParamRoleToRole(params.role as string);
  const currentPage = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '5';
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState('');
  const [openDeleteUser, setOpenDeleteUser] = useState<boolean>(false);
  const [userId, setUserId] = useState('');
  const [deletePerson, setDeletePerson] = useState<Record<string, any>>({
    '': {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  const {
    data: users,
    refetch,
    isFetching,
  } = useQuery<any, Error>({
    queryKey: ['currentPage', currentPage, 'pageSize', pageSize, 'licencePlate', licencePlate],
    queryFn: () => GetUsersPaginatedList(licencePlate, userRole, currentPage, pageSize),
    enabled: !!licencePlate,
  });

  const { data: userAdd } = useQuery<any, Error>({
    queryKey: ['userEmail', userEmail],
    queryFn: () => addUser(userEmail, users?.data.groupId),
    enabled: !!userEmail,
  });

  const { data: userDel } = useQuery<any, Error>({
    queryKey: ['userId', userId],
    queryFn: () => deleteUser(userId, users?.data.groupId),
    enabled: !!userId,
  });

  if (users) {
    rows = [...users?.data.users];
  }

  useEffect(() => {
    setTimeout(() => {
      if (userAdd || userDel) refetch();
    }, 700);
  }, [userAdd, userDel, refetch]);

  return (
    <div className="w-full">
      <TableAWSRoles
        tableTop={
          <UserAWSRolesTableTop
            title="BC Gov’s Landing Zone in AWS - Manage Users"
            subtitle="User Access"
            description="Assign roles to grant users access below"
            setOpenAddUser={setOpenAddUser}
          />
        }
        tableBody={
          rows.length === 0 && !isFetching ? (
            <EmptyBody userRole={userRole} setOpenAddUser={setOpenAddUser} />
          ) : (
            <TableBodyAWSRoles
              rows={rows}
              userRole={userRole}
              setOpenDeleteUser={setOpenDeleteUser}
              setDeletePerson={setDeletePerson}
            />
          )
        }
        currentPage={+currentPage}
        pageSize={+pageSize}
        total={users ? users?.data.total : 0}
      />
      <DeleteUserModal open={openDeleteUser} setOpen={setOpenDeleteUser} setUserId={setUserId} person={deletePerson} />
      <AddUserModal open={openAddUser} setOpen={setOpenAddUser} setUserEmail={setUserEmail} />
    </div>
  );
}
