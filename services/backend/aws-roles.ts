import { instance } from './axios';
import { tabName } from '@/app/api/public-cloud/aws-roles/helpers';

export async function getUsersPaginatedList(
  licencePlate: string,
  role: string,
  currentPage: string,
  pageSize: string,
  searchTerm: string,
) {
  const result = await instance
    .get(
      `public-cloud/aws-roles/getUsersList?licencePlate=${licencePlate}&role=${role}&page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
    )
    .then((res) => res.data);
  return result;
}

export async function addUser(userPrincipalName: string, userEmail: string, groupId: string) {
  const result = await instance
    .put(
      `public-cloud/aws-roles/addUser?userPrincipalName=${userPrincipalName}&userEmail=${userEmail}&groupId=${groupId}`,
    )
    .then((res) => res.data);
  return result;
}

export async function deleteUser(userId: string, groupId: string) {
  const result = await instance
    .delete(`public-cloud/aws-roles/deleteUser?userId=${userId}&groupId=${groupId}`)
    .then((res) => res.data);
  return result;
}

export async function getRolesNames(licencePlate: string): Promise<tabName[]> {
  const result = await instance
    .get(`public-cloud/aws-roles/getGroupRolesNames?licencePlate=${licencePlate}`)
    .then((res) => res.data);
  return result;
}
