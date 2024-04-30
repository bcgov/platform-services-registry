import { instance } from './axios';

export async function getInfo() {
  const result = await instance.get('/info').then((res) => res.data);
  return result;
}
