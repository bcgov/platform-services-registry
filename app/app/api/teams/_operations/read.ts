import { Session } from 'next-auth';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { getTeamDetail } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';

export default async function readOp({ session, id }: { session: Session; id: ObjectId }) {
  const team = await getTeamDetail(id);
  if (!team) return NotFoundResponse('Team not found');

  return OkResponse(team);
}
