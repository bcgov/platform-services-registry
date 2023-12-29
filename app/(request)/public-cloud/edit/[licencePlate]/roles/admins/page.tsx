import TableAWSRoles from '@/components/table/TableAWSRoles';
import { getSubGroupMembersByLicencePlateAndName, User, paramsURL } from '@/app/api/public-cloud/aws-roles/routes';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';

export default async function ProductAWSRoles(req: paramsURL) {
  const licencePlate = req.params.licencePlate;
  const currentPage: number = +req.searchParams.page || 1;
  const pageSize: number = +req.searchParams.pageSize || 5;
  const users = await getSubGroupMembersByLicencePlateAndName(licencePlate, 'Admin', {
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
        tableBody={<TableBodyAWSRoles rows={rows} />}
        currentPage={currentPage}
        pageSize={pageSize}
        total={users ? users.total : 0}
      />
    </div>
  );
}
