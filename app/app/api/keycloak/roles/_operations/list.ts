import { Session } from 'next-auth';
import { AUTH_RESOURCE } from '@/config';
import { OkResponse } from '@/core/responses';
import { listClientRoles } from '@/services/keycloak/app-realm';

export default async function listOp({ session }: { session: Session }) {
  const roles = await listClientRoles(AUTH_RESOURCE);

  return OkResponse(roles);
}
