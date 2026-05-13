import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, SystemStatus, EventType } from '@/prisma/client';
import { createEvent } from '@/services/db/event';
import { ObjectId } from '@/validation-schemas';
import { SystemBody } from '@/validation-schemas/system';

const systemDetailInclude = {
  organization: true,
  teamLinks: {
    include: {
      team: true,
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
} satisfies Prisma.SystemInclude;

const systemSimpleInclude = {
  organization: true,
} satisfies Prisma.SystemInclude;

function systemPermissions(session: Session) {
  return {
    view: session.permissions.viewSystems,
    edit: session.permissions.manageSystems,
    delete: session.permissions.manageSystems,
  };
}

export async function listSystems(session: Session) {
  const rows = await prisma.system.findMany({
    where: {
      OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
    },
    include: systemSimpleInclude,
    orderBy: { name: 'asc' },
  });

  return rows.map((row) => ({ ...row, _permissions: systemPermissions(session) }));
}

export async function getSystem(id: ObjectId, session: Session) {
  const row = await prisma.system.findUnique({
    where: { id },
    include: systemDetailInclude,
  });

  if (!row) {
    return null;
  }

  return { ...row, _permissions: systemPermissions(session) };
}

export async function createSystem(session: Session, body: SystemBody) {
  const row = await prisma.system.create({
    data: {
      ...body,
      code: body.code.toUpperCase(),
      organizationId: body.organizationId || null,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
      rules: body.rules as Prisma.InputJsonValue | undefined,
      policies: body.policies as Prisma.InputJsonValue | undefined,
      mappings: body.mappings as Prisma.InputJsonValue | undefined,
      archivedAt: null,
    },
    include: systemDetailInclude,
  });

  await createEvent(EventType.CREATE_SYSTEM, session.user.id, {
    id: row.id,
    data: { name: row.name, code: row.code },
  } as any);

  return { ...row, _permissions: systemPermissions(session) };
}

export async function updateSystem(id: ObjectId, session: Session, body: SystemBody) {
  const row = await prisma.system.update({
    where: { id },
    data: {
      ...body,
      code: body.code.toUpperCase(),
      organizationId: body.organizationId || null,
      status: body.status ?? SystemStatus.ACTIVE,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
      rules: body.rules as Prisma.InputJsonValue | undefined,
      policies: body.policies as Prisma.InputJsonValue | undefined,
      mappings: body.mappings as Prisma.InputJsonValue | undefined,
      archivedAt: body.status === SystemStatus.ARCHIVED ? new Date() : null,
    },
    include: systemDetailInclude,
  });

  await createEvent(EventType.UPDATE_SYSTEM, session.user.id, {
    id: row.id,
    data: { name: row.name, code: row.code },
  } as any);

  return { ...row, _permissions: systemPermissions(session) };
}

export async function archiveSystem(id: ObjectId, session: Session) {
  const row = await prisma.system.update({
    where: { id },
    data: {
      status: SystemStatus.ARCHIVED,
      archivedAt: new Date(),
    },
    include: systemDetailInclude,
  });

  await createEvent(EventType.DELETE_SYSTEM, session.user.id, {
    id: row.id,
    data: { name: row.name, code: row.code },
  } as any);

  return { ...row, _permissions: systemPermissions(session) };
}

export async function attachTeamToSystem(systemId: ObjectId, teamId: ObjectId) {
  await prisma.systemTeamLink.create({
    data: { systemId, teamId },
  });
}

export async function detachTeamFromSystem(systemId: ObjectId, teamId: ObjectId) {
  await prisma.systemTeamLink.deleteMany({
    where: { systemId, teamId },
  });
}

export async function attachPrivateCloudProductToSystem(systemId: ObjectId, privateCloudProductId: ObjectId) {
  await prisma.systemPrivateCloudProductLink.create({
    data: { systemId, privateCloudProductId },
  });
}

export async function detachPrivateCloudProductFromSystem(systemId: ObjectId, privateCloudProductId: ObjectId) {
  await prisma.systemPrivateCloudProductLink.deleteMany({
    where: { systemId, privateCloudProductId },
  });
}

export async function attachPublicCloudProductToSystem(systemId: ObjectId, publicCloudProductId: ObjectId) {
  await prisma.systemPublicCloudProductLink.create({
    data: { systemId, publicCloudProductId },
  });
}

export async function detachPublicCloudProductFromSystem(systemId: ObjectId, publicCloudProductId: ObjectId) {
  await prisma.systemPublicCloudProductLink.deleteMany({
    where: { systemId, publicCloudProductId },
  });
}

export async function getProductAttachmentSummary({
  context,
  productId,
  session,
}: {
  context: 'private' | 'public';
  productId: ObjectId;
  session: Session;
}) {
  const [systems, teams] =
    context === 'private'
      ? await Promise.all([
          prisma.system.findMany({
            where: {
              OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
              privateCloudProductLinks: { some: { privateCloudProductId: productId } },
            },
            include: systemSimpleInclude,
            orderBy: { name: 'asc' },
          }),
          prisma.team.findMany({
            where: {
              OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
              privateCloudProductLinks: { some: { privateCloudProductId: productId } },
            },
            orderBy: { name: 'asc' },
          }),
        ])
      : await Promise.all([
          prisma.system.findMany({
            where: {
              OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
              publicCloudProductLinks: { some: { publicCloudProductId: productId } },
            },
            include: systemSimpleInclude,
            orderBy: { name: 'asc' },
          }),
          prisma.team.findMany({
            where: {
              OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
              publicCloudProductLinks: { some: { publicCloudProductId: productId } },
            },
            orderBy: { name: 'asc' },
          }),
        ]);

  return {
    systems: systems.map((row) => ({ ...row, _permissions: systemPermissions(session) })),
    teams: teams.map((row) => ({
      ...row,
      _permissions: {
        view: session.permissions.viewTeams,
        edit: session.permissions.manageTeams,
        delete: session.permissions.manageTeams,
      },
    })),
  };
}
