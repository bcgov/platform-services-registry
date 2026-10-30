import prisma from '@/core/prisma';
import { EventType, Prisma, TeamRole } from '@/prisma/client';
import { createEvent } from '@/services/db/event';

type TeamMemberInput = {
  userId: string;
  roles: TeamRole[];
};

type TeamInput = {
  name: string;
  code: string;
  description?: string | null;
  members?: TeamMemberInput[];
};

// MongoDB leaves archivedAt unset (not null) on teams that were never archived.
const activeTeamConditions: Prisma.TeamWhereInput[] = [{ archivedAt: null }, { archivedAt: { isSet: false } }];

export const activeTeamWhere: Prisma.TeamWhereInput = { OR: activeTeamConditions };

const teamMemberInclude = { user: true } satisfies Prisma.TeamMemberInclude;

// Writes to a team only while it is active, so a write that races an archive fails instead of
// changing an archived team. Returns null when the team is no longer active.
async function updateActiveTeam(id: string, data: Prisma.TeamUpdateInput) {
  try {
    return await prisma.team.update({ where: { id, OR: activeTeamConditions }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null;
    throw error;
  }
}

export async function listTeams({ includeArchived = false }: { includeArchived?: boolean } = {}) {
  return await prisma.team.findMany({
    where: includeArchived ? undefined : activeTeamWhere,
    orderBy: { name: 'asc' },
  });
}

export async function getTeam(id: string) {
  return await prisma.team.findUnique({
    where: { id },
  });
}

export async function getTeamDetail(id: string) {
  return await prisma.team.findUnique({
    where: { id },
    include: { members: { include: teamMemberInclude, orderBy: { createdAt: 'asc' } } },
  });
}

export async function getTeamMember(teamId: string, userId: string) {
  return await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    include: teamMemberInclude,
  });
}

export async function findUnknownUserIds(userIds: string[]) {
  if (userIds.length === 0) return [];

  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true } });
  return userIds.filter((userId) => !users.some((user) => user.id === userId));
}

export async function createTeam(userId: string, body: TeamInput) {
  const { members = [], ...details } = body;

  const row = await prisma.team.create({
    data: {
      ...details,
      code: details.code.toUpperCase(),
      members: { create: members },
      archivedAt: null,
    },
  });

  await createEvent(EventType.CREATE_TEAM, userId, {
    id: row.id,
    data: { name: row.name, code: row.code },
  });

  return row;
}

// Updates the team details only. Members are changed one at a time with the member functions below.
// Returns null when the team is archived.
export async function updateTeam(id: string, userId: string, body: TeamInput) {
  const row = await updateActiveTeam(id, {
    name: body.name,
    code: body.code.toUpperCase(),
    description: body.description,
  });
  if (!row) return null;

  await createEvent(EventType.UPDATE_TEAM, userId, {
    id: row.id,
    data: { name: row.name, code: row.code },
  });

  return row;
}

export async function archiveTeam(id: string, userId: string) {
  const row = await prisma.team.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  await createEvent(EventType.DELETE_TEAM, userId, {
    id: row.id,
    data: { name: row.name, code: row.code },
  });

  return row;
}

export async function archiveTeams(ids: string[], userId: string) {
  return Promise.all(ids.map((id) => archiveTeam(id, userId)));
}

// The member functions return null when the team is archived.
export async function addTeamMember(id: string, userId: string, member: TeamMemberInput) {
  const row = await updateActiveTeam(id, { members: { create: member } });
  if (!row) return null;

  await createEvent(EventType.CREATE_TEAM_MEMBER, userId, { id, data: member });

  return getTeamMember(id, member.userId);
}

export async function updateTeamMemberRoles(id: string, userId: string, memberId: string, roles: TeamRole[]) {
  const row = await updateActiveTeam(id, {
    members: { update: { where: { id: memberId }, data: { roles } } },
  });
  if (!row) return null;

  const member = await prisma.teamMember.findUniqueOrThrow({ where: { id: memberId }, include: teamMemberInclude });
  await createEvent(EventType.UPDATE_TEAM_MEMBER, userId, { id, data: { userId: member.userId, roles } });

  return member;
}

export async function removeTeamMember(id: string, userId: string, memberId: string) {
  const member = await prisma.teamMember.findUniqueOrThrow({ where: { id: memberId }, include: teamMemberInclude });

  const row = await updateActiveTeam(id, { members: { delete: { id: memberId } } });
  if (!row) return null;

  await createEvent(EventType.DELETE_TEAM_MEMBER, userId, {
    id,
    data: { userId: member.userId, roles: member.roles },
  });

  return member;
}
