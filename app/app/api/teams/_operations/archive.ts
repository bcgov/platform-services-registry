import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { activeTeamWhere, archiveTeams } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';

export default async function archiveOp({ session, ids }: { session: Session; ids: ObjectId[] }) {
  const teams = await prisma.team.findMany({ where: { AND: [{ id: { in: ids } }, activeTeamWhere] } });
  if (teams.length === 0) return NotFoundResponse('No active teams found');

  const archived = await archiveTeams(
    teams.map((team) => team.id),
    session.user.id,
  );

  return OkResponse(archived);
}
