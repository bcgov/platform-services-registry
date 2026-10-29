import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { findUnknownMemberUserIds, getTeamDetail } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';
import { TeamBody } from '@/validation-schemas/team';

export default async function updateOp({ session, id, body }: { session: Session; id: ObjectId; body: TeamBody }) {
  const existing = await prisma.team.findUnique({ where: { id } });
  if (!existing) return NotFoundResponse('Team not found');
  if (existing.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  if (body.code !== existing.code) {
    const sameCode = await prisma.team.findUnique({ where: { code: body.code } });
    if (sameCode) return BadRequestResponse(`Team code ${body.code} already exists`);
  }

  const unknownUserIds = await findUnknownMemberUserIds(body.members);
  if (unknownUserIds.length > 0) {
    return BadRequestResponse(`Unknown users: ${unknownUserIds.join(', ')}`);
  }

  const team = await prisma.team.update({ where: { id }, data: body });

  await createEvent(EventType.UPDATE_TEAM, session.user.id, {
    id: team.id,
    data: { name: team.name, code: team.code },
  });

  return OkResponse(await getTeamDetail(team.id));
}
