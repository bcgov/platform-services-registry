import TableAWSRoles from '@/components/table/TableAWSRoles';
import { getSubGroupMembersByLicencePlateAndName, User } from '@/app/api/public-cloud/aws-roles/routes';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
export default async function ProductAWSRoles() {
  const users = await getSubGroupMembersByLicencePlateAndName('eu9cfk', 'Developers', 'Developer');
  let rows: Record<string, User>[] = [];

  if (users) {
    rows = [...users];
  }

  return (
    <div className="w-full">
      <TableAWSRoles
        tableBody={<TableBodyAWSRoles rows={rows} />}
        currentPage={1}
        pageSize={10}
        total={rows ? rows.length : 0}
      />
    </div>
  );
}
