'use client';

import TableAWSRoles from '@/components/table/TableAWSRoles';
import { User } from '@/app/api/public-cloud/aws-roles/helpers';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
import { capitalizeFirstLetter } from '@/components/utils/capitalizeFirstLetter';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';

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

  const { data } = useQuery<any, Error>({
    queryKey: ['currentPage', currentPage, 'pageSize', pageSize, 'licencePlate', licencePlate],
    queryFn: () => GetUsersPaginatedList(licencePlate, userRole, currentPage, pageSize),
    enabled: !!licencePlate,
  });

  if (data) {
    rows = [...data?.data.users];
  }

  return (
    <div className="w-full">
      <TableAWSRoles
        tableBody={<TableBodyAWSRoles rows={rows} groupId={data?.data.groupId} userRole={userRole} />}
        currentPage={currentPage}
        pageSize={pageSize}
        total={data ? data?.data.total : 0}
        groupId={data?.data.groupId}
      />
    </div>
  );
}
