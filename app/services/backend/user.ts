import { Prisma, User } from '@prisma/client';
import axios from 'axios';
import { userSorts } from '@/constants';
import { AdminViewUser } from '@/types/user';
import { UserSearchBody, UserUpdateBody } from '@/validation-schemas';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
  ...baseInstance.defaults,
  baseURL: `${baseInstance.defaults.baseURL}/users`,
});

function prepareSearchPayload(data: UserSearchBody) {
  const reqData = { ...data };
  const selectedOption = userSorts.find((sort) => sort.label === reqData.sortValue);

  if (selectedOption) {
    reqData.sortKey = selectedOption.sortKey;
    reqData.sortOrder = selectedOption.sortOrder;
  } else {
    reqData.sortKey = '';
    reqData.sortOrder = Prisma.SortOrder.desc;
  }

  return reqData;
}

export async function searchUsers(data: UserSearchBody) {
  const reqData = prepareSearchPayload(data);
  const result = await instance
    .post<{ data: AdminViewUser[]; totalCount: number }>('/search', reqData)
    .then((res) => res.data);
  return result;
}

export async function updateUser(id: string, data: UserUpdateBody) {
  const result = await instance.put(`/${id}`, data).then((res) => res.data);
  return result;
}
