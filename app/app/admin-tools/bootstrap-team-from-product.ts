import { logger } from '@/core/logging';
import {
  EventType,
  Prisma,
  type PrivateCloudProduct,
  type PrivateCloudProductMemberRole,
  type PublicCloudProduct,
  type PublicCloudProductMemberRole,
} from '@/prisma/client';
import prisma from './prisma';

type SourceProduct = {
  id: string;
  licencePlate: string;
  name: string;
  description: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

type TeamMemberInput = {
  userId: string;
  roles: string[];
};

type CommonAttachedUserIds = {
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId?: string | null;
};

export type TeamBootstrapResult =
  | {
      ok: true;
      alreadyExists: boolean;
      source: {
        type: string;
        id: string;
        licencePlate: string;
      };
      team: {
        id: string;
        code: string;
        name: string;
      };
      system: {
        id: string;
        code: string;
        name: string;
      };
    }
  | {
      ok: false;
      source: {
        type: string;
        id: string;
        licencePlate: string;
      };
      error: string;
    };

async function createAdminToolEvent(type: EventType, data: Prisma.InputJsonValue) {
  return prisma.event.create({
    data: {
      type,
      data,
    },
  });
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isBootstrappedFromProduct(
  team: { metadata?: Prisma.JsonValue | null },
  sourceModel: 'PublicCloudProduct' | 'PrivateCloudProduct',
  product: { id: string; licencePlate: string },
) {
  if (!isObjectRecord(team.metadata)) return false;
  const provenance = team.metadata.provenance;
  if (!isObjectRecord(provenance)) return false;
  const source = provenance.source;
  if (!isObjectRecord(source)) return false;

  return source.model === sourceModel && source.id === product.id && source.licencePlate === product.licencePlate;
}

function addRole(roleMap: Map<string, Set<string>>, userId: string | null | undefined, role: string) {
  if (!userId) return;

  const existing = roleMap.get(userId) ?? new Set<string>();
  existing.add(role);
  roleMap.set(userId, existing);
}

function finalizeMembers(roleMap: Map<string, Set<string>>): TeamMemberInput[] {
  return Array.from(roleMap.entries())
    .map(([userId, roles]) => ({
      userId,
      roles: Array.from(roles).sort(),
    }))
    .sort((a, b) => a.userId.localeCompare(b.userId));
}

function createBaseMemberMap(attachedUsers: CommonAttachedUserIds) {
  const roleMap = new Map<string, Set<string>>();
  addRole(roleMap, attachedUsers.projectOwnerId, 'PROJECT_OWNER');
  addRole(roleMap, attachedUsers.primaryTechnicalLeadId, 'PRIMARY_TECHNICAL_LEAD');
  addRole(roleMap, attachedUsers.secondaryTechnicalLeadId, 'SECONDARY_TECHNICAL_LEAD');
  return roleMap;
}

function mapPrivateMemberRole(role: PrivateCloudProductMemberRole): string {
  switch (role) {
    case 'EDITOR':
      return 'PRODUCT_EDITOR';
    case 'VIEWER':
      return 'PRODUCT_VIEWER';
    case 'SUBSCRIBER':
      return 'PRODUCT_SUBSCRIBER';
    default:
      return String(role);
  }
}

function mapPublicMemberRole(role: PublicCloudProductMemberRole): string {
  switch (role) {
    case 'EDITOR':
      return 'PRODUCT_EDITOR';
    case 'VIEWER':
      return 'PRODUCT_VIEWER';
    case 'SUBSCRIBER':
      return 'PRODUCT_SUBSCRIBER';
    case 'BILLING_VIEWER':
      return 'PRODUCT_BILLING_VIEWER';
    default:
      return String(role);
  }
}

function buildPrivateTeamMembers(
  product: Pick<
    PrivateCloudProduct,
    'projectOwnerId' | 'primaryTechnicalLeadId' | 'secondaryTechnicalLeadId' | 'members'
  >,
) {
  const roleMap = createBaseMemberMap(product);

  for (const member of product.members) {
    for (const role of member.roles) {
      addRole(roleMap, member.userId, mapPrivateMemberRole(role));
    }
  }

  return finalizeMembers(roleMap);
}

function buildPublicTeamMembers(
  product: Pick<
    PublicCloudProduct,
    'projectOwnerId' | 'primaryTechnicalLeadId' | 'secondaryTechnicalLeadId' | 'expenseAuthorityId' | 'members'
  >,
) {
  const roleMap = createBaseMemberMap(product);
  addRole(roleMap, product.expenseAuthorityId, 'EXPENSE_AUTHORITY');

  for (const member of product.members) {
    for (const role of member.roles) {
      addRole(roleMap, member.userId, mapPublicMemberRole(role));
    }
  }

  return finalizeMembers(roleMap);
}

async function createTeamAndLinks({
  product,
  sourceModel,
  sourceType,
  desiredName,
  desiredCode,
  members,
  metadata,
  mappings,
  findLinkedSystem,
  linkProduct,
}: {
  product: SourceProduct;
  sourceModel: 'PublicCloudProduct' | 'PrivateCloudProduct';
  sourceType: 'public-cloud-product' | 'private-cloud-product';
  desiredName: string;
  desiredCode: string;
  members: TeamMemberInput[];
  metadata: Prisma.InputJsonValue;
  mappings: Prisma.InputJsonValue;
  findLinkedSystem: (productId: string) => Promise<{ id: string; code: string; name: string } | null>;
  linkProduct: (teamId: string, productId: string) => Promise<void>;
}): Promise<TeamBootstrapResult> {
  const relationKey = sourceType === 'public-cloud-product' ? 'publicCloudProductLinks' : 'privateCloudProductLinks';
  const existingLinkedTeam = await prisma.team.findFirst({
    where: {
      [relationKey]: {
        some:
          sourceType === 'public-cloud-product'
            ? { publicCloudProductId: product.id }
            : { privateCloudProductId: product.id },
      },
    },
  });

  const linkedSystem = await findLinkedSystem(product.id);

  if (!linkedSystem) {
    return {
      ok: false,
      source: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
      error: 'No linked system found for this product. Run the system bootstrap tool first.',
    };
  }

  if (existingLinkedTeam) {
    const alreadySystemLinked = await prisma.systemTeamLink.findFirst({
      where: {
        teamId: existingLinkedTeam.id,
        systemId: linkedSystem.id,
      },
    });

    if (isBootstrappedFromProduct(existingLinkedTeam, sourceModel, product)) {
      if (!alreadySystemLinked) {
        await prisma.systemTeamLink.create({
          data: {
            teamId: existingLinkedTeam.id,
            systemId: linkedSystem.id,
          },
        });
      }

      return {
        ok: true,
        alreadyExists: true,
        source: {
          type: sourceType,
          id: product.id,
          licencePlate: product.licencePlate,
        },
        team: {
          id: existingLinkedTeam.id,
          code: existingLinkedTeam.code,
          name: existingLinkedTeam.name,
        },
        system: linkedSystem,
      };
    }

    return {
      ok: false,
      source: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
      error: `Already linked to team "${existingLinkedTeam.name}" (${existingLinkedTeam.id}).`,
    };
  }

  const existingCode = await prisma.team.findUnique({
    where: { code: desiredCode },
  });

  if (existingCode) {
    return {
      ok: false,
      source: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
      error: `Team code "${desiredCode}" already exists (${existingCode.id}).`,
    };
  }

  const created = await prisma.team.create({
    data: {
      name: desiredName,
      code: desiredCode,
      description: `Team bootstrapped from ${sourceType} ${product.licencePlate}.`,
      metadata,
      mappings,
      rules: {
        generatedBy: `admin-tool:create-team-from-${sourceType}`,
      } as Prisma.InputJsonValue,
      policies: {
        sourceOfTruth: `${sourceType}-bootstrap`,
        bootstrapMode: 'admin-tool',
      } as Prisma.InputJsonValue,
      members,
      archivedAt: product.archivedAt ?? null,
    },
  });

  try {
    await linkProduct(created.id, product.id);
    await prisma.systemTeamLink.create({
      data: {
        teamId: created.id,
        systemId: linkedSystem.id,
      },
    });
  } catch (error) {
    await prisma.team.delete({ where: { id: created.id } });
    throw error;
  }

  await createAdminToolEvent(EventType.CREATE_TEAM, {
    id: created.id,
    data: {
      name: created.name,
      code: created.code,
      systemId: linkedSystem.id,
      bootstrapSource: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
      membersCount: members.length,
    },
  } as Prisma.InputJsonValue);

  logger.info('Created team from source product', {
    sourceType,
    licencePlate: product.licencePlate,
    teamId: created.id,
    teamCode: created.code,
    teamName: created.name,
    systemId: linkedSystem.id,
  });

  return {
    ok: true,
    alreadyExists: false,
    source: {
      type: sourceType,
      id: product.id,
      licencePlate: product.licencePlate,
    },
    team: {
      id: created.id,
      code: created.code,
      name: created.name,
    },
    system: linkedSystem,
  };
}

export async function createTeamFromPublicCloudProduct(
  product: PublicCloudProduct & {
    providerSelectionReasons: string[];
    providerSelectionReasonsNote: string;
    environmentsEnabled: PublicCloudProduct['environmentsEnabled'];
    members: PublicCloudProduct['members'];
    budget: PublicCloudProduct['budget'];
    projectOwnerId: string;
    primaryTechnicalLeadId: string;
    secondaryTechnicalLeadId: string | null;
    expenseAuthorityId: string;
  },
) {
  const members = buildPublicTeamMembers(product);

  return createTeamAndLinks({
    product,
    sourceModel: 'PublicCloudProduct',
    sourceType: 'public-cloud-product',
    desiredName: `${product.name} Team`,
    desiredCode: `${product.licencePlate.toUpperCase()}-TEAM`,
    members,
    metadata: {
      provenance: {
        importedFrom: 'public-cloud-product',
        importedAt: new Date().toISOString(),
        source: {
          model: 'PublicCloudProduct',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      },
      sourceProductSnapshot: {
        licencePlate: product.licencePlate,
        name: product.name,
        description: product.description,
        provider: product.provider,
        organizationId: product.organizationId,
        projectOwnerId: product.projectOwnerId,
        primaryTechnicalLeadId: product.primaryTechnicalLeadId,
        secondaryTechnicalLeadId: product.secondaryTechnicalLeadId,
        expenseAuthorityId: product.expenseAuthorityId,
        members: product.members,
        budget: product.budget,
        providerSelectionReasons: product.providerSelectionReasons,
        providerSelectionReasonsNote: product.providerSelectionReasonsNote,
        environmentsEnabled: product.environmentsEnabled,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        archivedAt: product.archivedAt?.toISOString() ?? null,
      },
      bootstrapMembers: members,
    } as Prisma.InputJsonValue,
    mappings: {
      sourceRecords: [
        {
          model: 'PublicCloudProduct',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
      relatedSystemLookup: {
        relation: 'SystemPublicCloudProductLink',
        publicCloudProductId: product.id,
      },
    } as Prisma.InputJsonValue,
    findLinkedSystem: async (productId) =>
      prisma.system.findFirst({
        where: {
          publicCloudProductLinks: {
            some: {
              publicCloudProductId: productId,
            },
          },
        },
        select: {
          id: true,
          code: true,
          name: true,
        },
      }),
    linkProduct: async (teamId, productId) => {
      await prisma.teamPublicCloudProductLink.create({
        data: {
          teamId,
          publicCloudProductId: productId,
        },
      });
    },
  });
}

export async function createTeamFromPrivateCloudProduct(
  product: PrivateCloudProduct & {
    members: PrivateCloudProduct['members'];
    projectOwnerId: string;
    primaryTechnicalLeadId: string;
    secondaryTechnicalLeadId: string | null;
  },
) {
  const members = buildPrivateTeamMembers(product);

  return createTeamAndLinks({
    product,
    sourceModel: 'PrivateCloudProduct',
    sourceType: 'private-cloud-product',
    desiredName: `${product.name} Team`,
    desiredCode: `${product.licencePlate.toUpperCase()}-TEAM`,
    members,
    metadata: {
      provenance: {
        importedFrom: 'private-cloud-product',
        importedAt: new Date().toISOString(),
        source: {
          model: 'PrivateCloudProduct',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      },
      sourceProductSnapshot: {
        licencePlate: product.licencePlate,
        name: product.name,
        description: product.description,
        organizationId: product.organizationId,
        projectOwnerId: product.projectOwnerId,
        primaryTechnicalLeadId: product.primaryTechnicalLeadId,
        secondaryTechnicalLeadId: product.secondaryTechnicalLeadId,
        members: product.members,
        cluster: product.cluster,
        golddrEnabled: product.golddrEnabled,
        resourceRequests: product.resourceRequests,
        supportPhoneNumber: product.supportPhoneNumber,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        archivedAt: product.archivedAt?.toISOString() ?? null,
      },
      bootstrapMembers: members,
    } as Prisma.InputJsonValue,
    mappings: {
      sourceRecords: [
        {
          model: 'PrivateCloudProduct',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
      relatedSystemLookup: {
        relation: 'SystemPrivateCloudProductLink',
        privateCloudProductId: product.id,
      },
    } as Prisma.InputJsonValue,
    findLinkedSystem: async (productId) =>
      prisma.system.findFirst({
        where: {
          privateCloudProductLinks: {
            some: {
              privateCloudProductId: productId,
            },
          },
        },
        select: {
          id: true,
          code: true,
          name: true,
        },
      }),
    linkProduct: async (teamId, productId) => {
      await prisma.teamPrivateCloudProductLink.create({
        data: {
          teamId,
          privateCloudProductId: productId,
        },
      });
    },
  });
}
