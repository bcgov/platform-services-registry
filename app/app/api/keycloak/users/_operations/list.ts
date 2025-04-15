import { Session } from 'next-auth';
import { OkResponse } from '@/core/responses';
import { listUsersByRole } from '@/services/keycloak/app-realm';

export default async function listOp({ session }: { session: Session }) {
  const roles = await listUsersByRole('a');

  return OkResponse(roles);
}
