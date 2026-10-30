import { Session } from 'next-auth';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { TeamRole } from '@/prisma/client';
import { getTeam, getTeamMember, updateTeamMemberRoles } from '@/services/db/team';
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
  roles: TeamRole[];
}) {
  const team = await getTeam(id);
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const existing = await getTeamMember(id, userId);
  if (!existing) return NotFoundResponse('Team member not found');

  const member = await updateTeamMemberRoles(id, session.user.id, existing.id, roles);
  if (!member) return BadRequestResponse('Archived teams cannot be changed');

  return OkResponse(member);
}
