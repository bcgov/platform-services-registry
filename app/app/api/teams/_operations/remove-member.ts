import { Session } from 'next-auth';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { getTeam, getTeamMember, removeTeamMember } from '@/services/db/team';
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
  const team = await getTeam(id);
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const existing = await getTeamMember(id, userId);
  if (!existing) return NotFoundResponse('Team member not found');

  const member = await removeTeamMember(id, session.user.id, existing.id);
  if (!member) return BadRequestResponse('Archived teams cannot be changed');

  return OkResponse(member);
}
