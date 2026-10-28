import prisma from '@/core/prisma';
import { EventType, TeamRole } from '@/prisma/client';
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

export async function listTeams() {
  return await prisma.team.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    orderBy: { name: 'asc' },
  });
}

export async function getTeam(id: string) {
  return await prisma.team.findUnique({
    where: { id },
  });
}

export async function createTeam(userId: string, body: TeamInput) {
  const row = await prisma.team.create({
    data: {
      ...body,
      code: body.code.toUpperCase(),
      members: body.members ?? [],
      archivedAt: null,
    },
  });

  await createEvent(EventType.CREATE_TEAM, userId, {
    id: row.id,
    data: { name: row.name, code: row.code },
  });

  return row;
}

export async function updateTeam(id: string, userId: string, body: TeamInput) {
  const row = await prisma.team.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code.toUpperCase(),
      description: body.description,
      // Team membership updates are handled separately by updateTeamMembers().
      // Keep member changes out of general team updates for now.
      // ...(body.members !== undefined ? { members: body.members } : {}),
    },
  });

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

export async function updateTeamMembers(id: string, members: TeamMemberInput[]) {
  return await prisma.team.update({
    where: { id },
    data: { members },
  });
}
