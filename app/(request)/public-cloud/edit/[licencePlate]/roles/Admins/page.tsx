import TableAWSRoles from '@/components/table/TableAWSRoles';
import {
  getSubGroupMembersByLicencePlateAndName,
  getPublicCloudProjectUsers,
  User,
} from '@/app/api/public-cloud/aws-roles/routes';
import TableBodyAWSRoles from '@/components/table/TableBodyAWSRoles';
export default async function ProductAWSRoles() {
  const users = await getSubGroupMembersByLicencePlateAndName('eu9cfk', 'Admins', 'Admin');
  const registryUsers = await getPublicCloudProjectUsers('A1VEcjg');

  let rows: Record<string, User>[] = [];

  if (users && registryUsers) {
    rows = [...registryUsers, ...users];
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
