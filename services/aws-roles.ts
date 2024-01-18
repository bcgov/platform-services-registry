import { instance } from './axios';

export async function GetUsersPaginatedList(
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

export async function addUser(userEmail: string, groupId: string) {
  const result = await instance
    .put(`public-cloud/aws-roles/addUser?userEmail=${userEmail}&groupId=${groupId}`)
    .then((res) => res.data);
  return result;
}

export async function deleteUser(userId: string, groupId: string) {
  const result = await instance
    .delete(`public-cloud/aws-roles/deleteUser?userId=${userId}&groupId=${groupId}`)
    .then((res) => res.data);
  return result;
}
