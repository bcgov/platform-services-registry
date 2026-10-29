import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { activeTeamWhere } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';

export default async function archiveOp({ session, ids }: { session: Session; ids: ObjectId[] }) {
  const teams = await prisma.team.findMany({ where: { AND: [{ id: { in: ids } }, activeTeamWhere] } });
  if (teams.length === 0) return NotFoundResponse('No active teams found');

  const archivedAt = new Date();
  await prisma.team.updateMany({ where: { id: { in: teams.map((team) => team.id) } }, data: { archivedAt } });

  await Promise.all(
    teams.map((team) =>
      createEvent(EventType.DELETE_TEAM, session.user.id, {
        id: team.id,
        data: { name: team.name, code: team.code },
      }),
    ),
  );

  return OkResponse(teams.map((team) => ({ ...team, archivedAt })));
}
