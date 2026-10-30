import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType, TeamMemberRole } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { getTeamMember, updateActiveTeam } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';

export default async function updateMemberOp({
  session,
  id,
  userId,
  roles,
}: {
  session: Session;
  id: ObjectId;
  userId: ObjectId;
  roles: TeamMemberRole[];
}) {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const existing = await getTeamMember(id, userId);
  if (!existing) return NotFoundResponse('Team member not found');

  const updated = await updateActiveTeam(id, {
    members: { update: { where: { id: existing.id }, data: { roles } } },
  });
  if (!updated) return BadRequestResponse('Archived teams cannot be changed');

  await createEvent(EventType.UPDATE_TEAM_MEMBER, session.user.id, {
    id,
    data: { userId, roles },
  });

  return OkResponse(await getTeamMember(id, userId));
}
