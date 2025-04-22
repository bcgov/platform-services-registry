import { SecurityConfig, ProjectContext } from '@/prisma/types';
import { instance } from './axios';

export async function getSecurityConfig(licencePlate: string, context: ProjectContext) {
  const result = await instance.get(`/security-config/${licencePlate}?context=${context}`).then((res) => res.data);
  return result;
}

export async function upsertSecurityConfig(data: SecurityConfig) {
  const result = await instance.put('/security-config', data).then((res) => res.data);
  return result;
}
