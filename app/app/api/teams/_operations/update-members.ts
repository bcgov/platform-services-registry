import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { findUnknownMemberUserIds, getTeamDetail } from '@/services/db/team';
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

  const team = await prisma.team.update({ where: { id }, data: { members } });

  await createEvent(EventType.UPDATE_TEAM, session.user.id, {
    id: team.id,
    data: { name: team.name, code: team.code },
  });

  const detail = await getTeamDetail(team.id);
  return OkResponse(detail?.members ?? []);
}
