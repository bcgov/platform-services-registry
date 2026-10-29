import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { activeTeamWhere, findUnknownMemberUserIds, getTeamDetail } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';
import { TeamUpdateBody } from '@/validation-schemas/team';

export default async function updateOp({
  session,
  id,
  body,
}: {
  session: Session;
  id: ObjectId;
  body: TeamUpdateBody;
}) {
  const existing = await prisma.team.findUnique({ where: { id } });
  if (!existing) return NotFoundResponse('Team not found');
  if (existing.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  if (body.code !== existing.code) {
    const sameCode = await prisma.team.findUnique({ where: { code: body.code } });
    if (sameCode) return BadRequestResponse(`Team code ${body.code} already exists`);
  }

  if (body.members) {
    const unknownUserIds = await findUnknownMemberUserIds(body.members);
    if (unknownUserIds.length > 0) {
      return BadRequestResponse(`Unknown users: ${unknownUserIds.join(', ')}`);
    }
  }

  // Filter on active teams in the write too, in case the team was archived after the read above.
  const { count } = await prisma.team.updateMany({ where: { id, ...activeTeamWhere }, data: body });
  if (count === 0) return BadRequestResponse('Archived teams cannot be changed');

  await createEvent(EventType.UPDATE_TEAM, session.user.id, {
    id,
    data: { name: body.name, code: body.code },
  });

  return OkResponse(await getTeamDetail(id));
}
