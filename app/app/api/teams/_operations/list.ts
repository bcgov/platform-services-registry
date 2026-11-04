import { Session } from 'next-auth';
import { OkResponse } from '@/core/responses';
import { listTeams } from '@/services/db/team';

export default async function listOp({ session, includeArchived }: { session: Session; includeArchived: boolean }) {
  const teams = await listTeams({ includeArchived });

  return OkResponse(teams);
}
