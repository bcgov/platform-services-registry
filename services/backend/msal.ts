import { instance } from './axios';

export async function listUsersByEmail(email: string) {
  const result = await instance.get(`/msal/list-users-by-email?email=${email}`).then((res) => res.data);
  return result;
}
