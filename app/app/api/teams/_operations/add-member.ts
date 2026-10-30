import { Session } from 'next-auth';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { addTeamMember, findUnknownUserIds, getTeam, getTeamMember } from '@/services/db/team';
import { ObjectId } from '@/validation-schemas';
import { TeamMemberBody } from '@/validation-schemas/team';

export default async function addMemberOp({
  session,
  id,
  body,
}: {
  session: Session;
  id: ObjectId;
  body: TeamMemberBody;
}) {
  const team = await getTeam(id);
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const unknownUserIds = await findUnknownUserIds([body.userId]);
  if (unknownUserIds.length > 0) return BadRequestResponse(`Unknown user: ${body.userId}`);

  const existing = await getTeamMember(id, body.userId);
  if (existing) return BadRequestResponse('This user is already a member of the team');

  const member = await addTeamMember(id, session.user.id, body);
  if (!member) return BadRequestResponse('Archived teams cannot be changed');

  return OkResponse(member);
}
