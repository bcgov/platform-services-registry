import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { findUnknownUserIds, getTeamMember, updateActiveTeam } from '@/services/db/team';
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
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return NotFoundResponse('Team not found');
  if (team.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  const unknownUserIds = await findUnknownUserIds([body.userId]);
  if (unknownUserIds.length > 0) return BadRequestResponse(`Unknown user: ${body.userId}`);

  const existing = await getTeamMember(id, body.userId);
  if (existing) return BadRequestResponse('This user is already a member of the team');

  const updated = await updateActiveTeam(id, { members: { create: body } });
  if (!updated) return BadRequestResponse('Archived teams cannot be changed');

  await createEvent(EventType.CREATE_TEAM_MEMBER, session.user.id, {
    id,
    data: { userId: body.userId, roles: body.roles },
  });

  return OkResponse(await getTeamMember(id, body.userId));
}
