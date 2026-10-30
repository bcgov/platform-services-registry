import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { getTeamMember, updateActiveTeam } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';

export default async function removeMemberOp({
  session,
  id,
  userId,
}: {
  session: Session;
  id: ObjectId;
  userId: ObjectId;
}) {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const existing = await getTeamMember(id, userId);
  if (!existing) return NotFoundResponse('Team member not found');

  const updated = await updateActiveTeam(id, { members: { delete: { id: existing.id } } });
  if (!updated) return BadRequestResponse('Archived teams cannot be changed');

  await createEvent(EventType.DELETE_TEAM_MEMBER, session.user.id, {
    id,
    data: { userId, roles: existing.roles },
  });

  return OkResponse(existing);
}
