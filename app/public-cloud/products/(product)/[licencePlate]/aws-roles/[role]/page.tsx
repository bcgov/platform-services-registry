'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@/app/api/public-cloud/aws-roles/helpers';
import EmptyBody from '@/components/EmptyUsersList';
import AddUserModal from '@/components/modal/AddUser';
import DeleteUserModal from '@/components/modal/DeleteUser';
import ErrorModal from '@/components/modal/Error';
import TableAWSRoles from '@/components/table/TableAWSRoles';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
import UserAWSRolesTableTop from '@/components/table/TableTopUserAWSRoles';
import { getUsersPaginatedList, addUser, deleteUser, getRolesNames } from '@/services/backend/aws-roles';
import { capitalizeFirstLetter } from '@/utils/string';

const pathParamRoleToRole = (pathRole: string): string => {
  const role = capitalizeFirstLetter(pathRole.replace(/-/g, ' ').slice(0, -1));
  return role;
};

export default function ProductAWSRoles() {
  let rows: Record<string, User>[] = [];
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const licencePlate = params.licencePlate as string;
  const userRole = pathParamRoleToRole(params.role as string);
  const currentPage = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '5';
  const searchTerm = searchParams.get('search') || '';
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [userPrincipalName, setUserPrincipalName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [openDeleteUser, setOpenDeleteUser] = useState<boolean>(false);
  const [userId, setUserId] = useState('');
  const [deletePerson, setDeletePerson] = useState<User>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {
    data: users,
    refetch,
    isLoading: isUsersFetching,
    error: fetchingUsersError,
  } = useQuery<any, Error>({
    queryKey: ['currentPage', currentPage, 'pageSize', pageSize, 'licencePlate', licencePlate],
    queryFn: () => getUsersPaginatedList(licencePlate, userRole, currentPage, pageSize, searchTerm),
    enabled: !!licencePlate,
  });

  if (fetchingUsersError) {
    setShowErrorModal(true);
    setErrorMessage(String(fetchingUsersError));
  }

  const { data: userAdd, error: fetchingUserAddError } = useQuery<string, Error>({
    queryKey: ['userEmail', userEmail],
    queryFn: () => addUser(userPrincipalName, userEmail, users?.groupId),
    enabled: !!userPrincipalName,
  });

  if (fetchingUserAddError) {
    setShowErrorModal(true);
    setErrorMessage(String(fetchingUserAddError));
  }

  const { data: userDel, error: fetchingUserDelError } = useQuery<string, Error>({
    queryKey: ['userId', userId],
    queryFn: () => deleteUser(userId, users?.groupId),
    enabled: !!userId,
  });

  if (fetchingUserDelError) {
    setShowErrorModal(true);
    setErrorMessage(String(fetchingUserDelError));
  }

  if (users) {
    rows = [...users?.users];
  }

  useEffect(() => {
    setTimeout(() => {
      if (userAdd || userDel) refetch();
    }, 700);
  }, [userAdd, userDel, refetch]);

  useEffect(() => {
    refetch();
  }, [searchTerm, refetch]);

  const {
    data: roles,
    isLoading: isRolesFetching,
    error: fetchingRolesError,
  } = useQuery<any, Error>({
    queryKey: ['licencePlate', licencePlate],
    queryFn: () => getRolesNames(licencePlate),
    enabled: !!licencePlate,
  });

  if (roles && roles.length === 0) {
    return (
      <div className="w-full">
        Looks like role groups haven&apos;t been created for this product, please, reach out Public Cloud Platform
        Administrators{' '}
        <a href="mailto:Cloud.Pathfinder@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
          Cloud.Pathfinder@gov.bc.ca
        </a>
      </div>
    );
  }

  if (isRolesFetching || isUsersFetching) {
    return null;
  }

  return (
    <div className="w-full">
      <TableAWSRoles
        tableTop={
          <UserAWSRolesTableTop
            title="BC Gov’s Landing Zone in AWS - Manage Users"
            subtitle="User Access"
            description="Assign roles to grant users access below"
            setOpenAddUser={setOpenAddUser}
            roles={roles}
          />
        }
        tableBody={
          rows.length === 0 ? (
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
        total={users ? users?.total : 0}
      />
      <DeleteUserModal
        open={openDeleteUser}
        setOpen={setOpenDeleteUser}
        setUserId={setUserId}
        person={deletePerson}
        userRole={userRole}
      />
      <AddUserModal
        open={openAddUser}
        setOpen={setOpenAddUser}
        setUserPrincipalName={setUserPrincipalName}
        setUserEmail={setUserEmail}
      />
      <ErrorModal
        open={showErrorModal}
        setOpen={setShowErrorModal}
        errorMessage={errorMessage}
        redirectUrl={pathName}
      />
    </div>
  );
}
