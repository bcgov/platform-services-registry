import { Session } from 'next-auth';
import { AUTH_RESOURCE } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { getKcAdminClient, listClientRoles } from '@/services/keycloak/app-realm';

export default async function listOp({ session }: { session: Session }) {
  const roles = await listClientRoles(AUTH_RESOURCE);

  return OkResponse(roles);
}
