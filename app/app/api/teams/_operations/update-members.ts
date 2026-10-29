import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { activeTeamWhere, findUnknownMemberUserIds, getTeamDetail } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';
import { TeamMembers } from '@/validation-schemas/team';

export default async function updateMembersOp({
  session,
  id,
  members,
}: {
  session: Session;
  id: ObjectId;
  members: TeamMembers;
}) {
  const existing = await prisma.team.findUnique({ where: { id } });
  if (!existing) return NotFoundResponse('Team not found');
  if (existing.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const unknownUserIds = await findUnknownMemberUserIds(members);
  if (unknownUserIds.length > 0) {
    return BadRequestResponse(`Unknown users: ${unknownUserIds.join(', ')}`);
  }

  // Filter on active teams in the write too, in case the team was archived after the read above.
  const { count } = await prisma.team.updateMany({ where: { id, ...activeTeamWhere }, data: { members } });
  if (count === 0) return BadRequestResponse('Archived teams cannot be changed');

  await createEvent(EventType.UPDATE_TEAM, session.user.id, {
    id,
    data: { name: existing.name, code: existing.code },
  });

  const detail = await getTeamDetail(id);
  return OkResponse(detail?.members ?? []);
}
