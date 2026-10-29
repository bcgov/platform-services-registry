import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { findUnknownMemberUserIds, getTeamDetail } from '@/services/db/team';
import { TeamBody } from '@/validation-schemas/team';

export default async function createOp({ session, body }: { session: Session; body: TeamBody }) {
  const existing = await prisma.team.findUnique({ where: { code: body.code } });
  if (existing) {
    return BadRequestResponse(`Team code ${body.code} already exists`);
  }

  const unknownUserIds = await findUnknownMemberUserIds(body.members);
  if (unknownUserIds.length > 0) {
    return BadRequestResponse(`Unknown users: ${unknownUserIds.join(', ')}`);
  }

  const team = await prisma.team.create({ data: body });

  await createEvent(EventType.CREATE_TEAM, session.user.id, {
    id: team.id,
    data: { name: team.name, code: team.code },
  });

  return OkResponse(await getTeamDetail(team.id));
}
