import TableAWSRoles from '@/components/table/TableAWSRoles';
import { getSubGroupMembersByLicencePlateAndName, User, paramsURL } from '@/app/api/public-cloud/aws-roles/route';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
import { capitalizeFirstLetter } from '@/components/utils/capitalizeFirstLetter';

const pathParamRoleToRole = (pathRole: string): string => {
  const role = capitalizeFirstLetter(pathRole.replace(/-/g, ' ').slice(0, -1));
  return role;
};

export default async function ProductAWSRoles(req: paramsURL) {
  const licencePlate = req.params.licencePlate;
  const currentPage: number = +req.searchParams.page || 1;
  const pageSize: number = +req.searchParams.pageSize || 5;
  const userRole = pathParamRoleToRole(req.params.role);

  const users = await getSubGroupMembersByLicencePlateAndName(licencePlate, userRole, {
    page: currentPage,
    pageSize: pageSize,
  });

  let rows: Record<string, User>[] = [];
  if (users) {
    rows = [...users.users];
  }

  return (
    <div className="w-full">
      <TableAWSRoles
        tableBody={<TableBodyAWSRoles rows={rows} groupId={users.groupId} userRole={userRole} />}
        currentPage={currentPage}
        pageSize={pageSize}
        total={users ? users.total : 0}
        groupId={users.groupId}
      />
    </div>
  );
}
