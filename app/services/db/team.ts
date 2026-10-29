import prisma from '@/core/prisma';
import { Prisma } from '@/prisma/client';
import { ObjectId } from '@/validation-schemas';
import { TeamMembers } from '@/validation-schemas/team';

// MongoDB leaves archivedAt unset (not null) on teams that were never archived.
export const activeTeamWhere: Prisma.TeamWhereInput = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};

export async function getTeamDetail(id: ObjectId) {
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) return null;

  const users = team.members.length
    ? await prisma.user.findMany({ where: { id: { in: team.members.map((member) => member.userId) } } })
    : [];

  return {
    ...team,
    members: team.members.map((member) => ({
      ...member,
      user: users.find((user) => user.id === member.userId) ?? null,
    })),
  };
}

export async function findUnknownMemberUserIds(members: TeamMembers) {
  if (members.length === 0) return [];

  const userIds = members.map((member) => member.userId);
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } });
  return userIds.filter((userId) => !users.some((user) => user.id === userId));
}
