import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { getTeam, getTeamDetail, updateTeam } from '@/services/db/team';
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
  const existing = await getTeam(id);
  if (!existing) return NotFoundResponse('Team not found');
  if (existing.archivedAt) return BadRequestResponse('Archived teams cannot be changed');

  if (body.code !== existing.code) {
    const sameCode = await prisma.team.findUnique({ where: { code: body.code } });
    if (sameCode) return BadRequestResponse(`Team code ${body.code} already exists`);
  }

  const updated = await updateTeam(id, session.user.id, body);
  if (!updated) return BadRequestResponse('Archived teams cannot be changed');

  return OkResponse(await getTeamDetail(id));
}
