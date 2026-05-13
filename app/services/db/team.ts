import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, EventType } from '@/prisma/client';
import { createEvent } from '@/services/db/event';
import { ObjectId } from '@/validation-schemas';
import { TeamBody } from '@/validation-schemas/team';

const teamDetailInclude = {
  systemLinks: {
    include: {
      system: {
        include: {
          organization: true,
        },
      },
    },
  },
  privateCloudProductLinks: {
    include: {
      privateCloudProduct: {
        include: {
          organization: true,
        },
      },
    },
  },
  publicCloudProductLinks: {
    include: {
      publicCloudProduct: {
        include: {
          organization: true,
        },
      },
    },
  },
} satisfies Prisma.TeamInclude;

function teamPermissions(session: Session) {
  return {
    view: session.permissions.viewTeams,
    edit: session.permissions.manageTeams,
    delete: session.permissions.manageTeams,
  };
}

export async function listTeams(session: Session) {
  const rows = await prisma.team.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    orderBy: { name: 'asc' },
  });

  return rows.map((row) => ({ ...row, _permissions: teamPermissions(session) }));
}

export async function getTeam(id: ObjectId, session: Session) {
  const row = await prisma.team.findUnique({
    where: { id },
    include: teamDetailInclude,
  });

  if (!row) {
    return null;
  }

  const users = row.members.length
    ? await prisma.user.findMany({
        where: {
          id: { in: row.members.map((member) => member.userId) },
        },
      })
    : [];

  return {
    ...row,
    members: row.members.map((member) => ({
      ...member,
      user: users.find((user) => user.id === member.userId) || null,
    })),
    _permissions: teamPermissions(session),
  };
}

export async function createTeam(session: Session, body: TeamBody) {
  const row = await prisma.team.create({
    data: {
      ...body,
      code: body.code.toUpperCase(),
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
      rules: body.rules as Prisma.InputJsonValue | undefined,
      policies: body.policies as Prisma.InputJsonValue | undefined,
      mappings: body.mappings as Prisma.InputJsonValue | undefined,
      archivedAt: null,
    },
    include: teamDetailInclude,
  });

  await createEvent(EventType.CREATE_TEAM, session.user.id, {
    id: row.id,
    data: { name: row.name, code: row.code },
  } as any);

  return getTeam(row.id, session);
}

export async function updateTeam(id: ObjectId, session: Session, body: TeamBody) {
  await prisma.team.update({
    where: { id },
    data: {
      ...body,
      code: body.code.toUpperCase(),
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
      rules: body.rules as Prisma.InputJsonValue | undefined,
      policies: body.policies as Prisma.InputJsonValue | undefined,
      mappings: body.mappings as Prisma.InputJsonValue | undefined,
    },
  });

  await createEvent(EventType.UPDATE_TEAM, session.user.id, {
    id,
    data: { name: body.name, code: body.code.toUpperCase() },
  } as any);

  return getTeam(id, session);
}

export async function archiveTeam(id: ObjectId, session: Session) {
  const row = await prisma.team.update({
    where: { id },
    data: {
      archivedAt: new Date(),
    },
  });

  await createEvent(EventType.DELETE_TEAM, session.user.id, {
    id: row.id,
    data: { name: row.name, code: row.code },
  } as any);

  return getTeam(id, session);
}

export async function updateTeamMembers(id: ObjectId, members: TeamBody['members'], session: Session) {
  await prisma.team.update({
    where: { id },
    data: { members },
  });

  return getTeam(id, session);
}

export async function attachSystemToTeam(teamId: ObjectId, systemId: ObjectId) {
  await prisma.systemTeamLink.create({
    data: { systemId, teamId },
  });
}

export async function detachSystemFromTeam(teamId: ObjectId, systemId: ObjectId) {
  await prisma.systemTeamLink.deleteMany({
    where: { systemId, teamId },
  });
}

export async function attachPrivateCloudProductToTeam(teamId: ObjectId, privateCloudProductId: ObjectId) {
  await prisma.teamPrivateCloudProductLink.create({
    data: { teamId, privateCloudProductId },
  });
}

export async function detachPrivateCloudProductFromTeam(teamId: ObjectId, privateCloudProductId: ObjectId) {
  await prisma.teamPrivateCloudProductLink.deleteMany({
    where: { teamId, privateCloudProductId },
  });
}

export async function attachPublicCloudProductToTeam(teamId: ObjectId, publicCloudProductId: ObjectId) {
  await prisma.teamPublicCloudProductLink.create({
    data: { teamId, publicCloudProductId },
  });
}

export async function detachPublicCloudProductFromTeam(teamId: ObjectId, publicCloudProductId: ObjectId) {
  await prisma.teamPublicCloudProductLink.deleteMany({
    where: { teamId, publicCloudProductId },
  });
}
