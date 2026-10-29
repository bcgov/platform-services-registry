import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { activeTeamWhere } from '@/services/db/team';

export default async function listOp({ session, includeArchived }: { session: Session; includeArchived: boolean }) {
  const teams = await prisma.team.findMany({
    where: includeArchived ? undefined : activeTeamWhere,
    orderBy: { name: 'asc' },
  });

  return OkResponse(teams);
}
