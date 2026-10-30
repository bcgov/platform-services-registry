import prisma from '@/core/prisma';
import { Prisma } from '@/prisma/client';
import { ObjectId } from '@/validation-schemas';

// MongoDB leaves archivedAt unset (not null) on teams that were never archived.
const activeTeamConditions: Prisma.TeamWhereInput[] = [{ archivedAt: null }, { archivedAt: { isSet: false } }];

export const activeTeamWhere: Prisma.TeamWhereInput = { OR: activeTeamConditions };

const teamMemberInclude = { user: true } satisfies Prisma.TeamMemberInclude;

export async function getTeamDetail(id: ObjectId) {
  return prisma.team.findUnique({
    where: { id },
    include: { members: { include: teamMemberInclude, orderBy: { createdAt: 'asc' } } },
  });
}

export async function getTeamMember(teamId: ObjectId, userId: ObjectId) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    include: teamMemberInclude,
  });
}

export async function findUnknownUserIds(userIds: ObjectId[]) {
  if (userIds.length === 0) return [];

  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } });
  return userIds.filter((userId) => !users.some((user) => user.id === userId));
}

// Writes to a team only while it is active, so a write that races an archive fails instead of
// changing an archived team. Returns false when the team is no longer active.
export async function updateActiveTeam(id: ObjectId, data: Prisma.TeamUpdateInput) {
  try {
    await prisma.team.update({ where: { id, OR: activeTeamConditions }, data });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return false;
    throw error;
  }
}
