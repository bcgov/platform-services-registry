import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { createTeam, findUnknownUserIds, getTeamDetail } from '@/services/db/team';
import { TeamBody } from '@/validation-schemas/team';

export default async function createOp({ session, body }: { session: Session; body: TeamBody }) {
  const existing = await prisma.team.findUnique({ where: { code: body.code } });
  if (existing) {
    return BadRequestResponse(`Team code ${body.code} already exists`);
  }

  const unknownUserIds = await findUnknownUserIds(body.members.map((member) => member.userId));
  if (unknownUserIds.length > 0) {
    return BadRequestResponse(`Unknown users: ${unknownUserIds.join(', ')}`);
  }

  const team = await createTeam(session.user.id, body);

  return OkResponse(await getTeamDetail(team.id));
}
