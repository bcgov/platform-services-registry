import { logger } from '@/core/logging';
import {
  EventType,
  Prisma,
  ProjectStatus,
  SystemStatus,
  type PrivateCloudProduct,
  type PublicCloudProduct,
} from '@/prisma/client';
import prisma from './prisma';

type SourceProduct = {
  id: string;
  licencePlate: string;
  name: string;
  description: string;
  status: ProjectStatus;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

export type BootstrapResult =
  | {
      ok: true;
      alreadyExists: boolean;
      source: {
        type: string;
        id: string;
        licencePlate: string;
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

function mapProductStatusToSystemStatus(status: ProjectStatus): SystemStatus {
  return status === ProjectStatus.INACTIVE ? SystemStatus.ARCHIVED : SystemStatus.ACTIVE;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isBootstrappedFromProduct(
  system: { metadata?: Prisma.JsonValue | null },
  sourceModel: 'PublicCloudProduct' | 'PrivateCloudProduct',
  product: { id: string; licencePlate: string },
) {
  if (!isObjectRecord(system.metadata)) return false;
  const provenance = system.metadata.provenance;
  if (!isObjectRecord(provenance)) return false;
  const source = provenance.source;
  if (!isObjectRecord(source)) return false;

  return source.model === sourceModel && source.id === product.id && source.licencePlate === product.licencePlate;
}

async function createSystemAndLink({
  product,
  sourceModel,
  sourceType,
  metadata,
  mappings,
  linkCreate,
}: {
  product: SourceProduct;
  sourceModel: 'PublicCloudProduct' | 'PrivateCloudProduct';
  sourceType: 'public-cloud-product' | 'private-cloud-product';
  metadata: Prisma.InputJsonValue;
  mappings: Prisma.InputJsonValue;
  linkCreate: (systemId: string, productId: string) => Promise<void>;
}): Promise<BootstrapResult> {
  const existingLinkedSystem = await prisma.system.findFirst({
    where: {
      [sourceType === 'public-cloud-product' ? 'publicCloudProductLinks' : 'privateCloudProductLinks']: {
        some:
          sourceType === 'public-cloud-product'
            ? { publicCloudProductId: product.id }
            : { privateCloudProductId: product.id },
      },
    },
  });

  if (existingLinkedSystem) {
    if (isBootstrappedFromProduct(existingLinkedSystem, sourceModel, product)) {
      return {
        ok: true,
        alreadyExists: true,
        source: {
          type: sourceType,
          id: product.id,
          licencePlate: product.licencePlate,
        },
        system: {
          id: existingLinkedSystem.id,
          code: existingLinkedSystem.code,
          name: existingLinkedSystem.name,
        },
      };
    }

    return {
      ok: false,
      source: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
      error: `Already linked to system "${existingLinkedSystem.name}" (${existingLinkedSystem.id}).`,
    };
  }

  const desiredCode = product.licencePlate.toUpperCase();
  const existingCode = await prisma.system.findUnique({
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
      error: `System code "${desiredCode}" already exists (${existingCode.id}).`,
    };
  }

  const created = await prisma.system.create({
    data: {
      name: product.name,
      code: desiredCode,
      description: product.description,
      status: mapProductStatusToSystemStatus(product.status),
      organizationId: product.organizationId,
      metadata,
      mappings,
      rules: {
        generatedBy: `admin-tool:create-system-from-${sourceType}`,
      } as Prisma.InputJsonValue,
      policies: {
        sourceOfTruth: `${sourceType}-bootstrap`,
        bootstrapMode: 'admin-tool',
      } as Prisma.InputJsonValue,
      archivedAt: product.archivedAt ?? null,
    },
  });

  try {
    await linkCreate(created.id, product.id);
  } catch (error) {
    await prisma.system.delete({ where: { id: created.id } });
    throw error;
  }

  await createAdminToolEvent(EventType.CREATE_SYSTEM, {
    id: created.id,
    data: {
      name: created.name,
      code: created.code,
      bootstrapSource: {
        type: sourceType,
        id: product.id,
        licencePlate: product.licencePlate,
      },
    },
  } as Prisma.InputJsonValue);

  logger.info('Created system from source product', {
    sourceType,
    licencePlate: product.licencePlate,
    systemId: created.id,
    systemCode: created.code,
    systemName: created.name,
  });

  return {
    ok: true,
    alreadyExists: false,
    source: {
      type: sourceType,
      id: product.id,
      licencePlate: product.licencePlate,
    },
    system: {
      id: created.id,
      code: created.code,
      name: created.name,
    },
  };
}

export async function createSystemFromPublicCloudProduct(
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
  return createSystemAndLink({
    product,
    sourceModel: 'PublicCloudProduct',
    sourceType: 'public-cloud-product',
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
        provider: product.provider,
        status: product.status,
        organizationId: product.organizationId,
        projectOwnerId: product.projectOwnerId,
        primaryTechnicalLeadId: product.primaryTechnicalLeadId,
        secondaryTechnicalLeadId: product.secondaryTechnicalLeadId,
        expenseAuthorityId: product.expenseAuthorityId,
        providerSelectionReasons: product.providerSelectionReasons,
        providerSelectionReasonsNote: product.providerSelectionReasonsNote,
        environmentsEnabled: product.environmentsEnabled,
        members: product.members,
        budget: product.budget,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        archivedAt: product.archivedAt?.toISOString() ?? null,
      },
    } as Prisma.InputJsonValue,
    mappings: {
      sourceRecords: [
        {
          type: 'public-cloud-product',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
      resourceLinks: [
        {
          type: 'public-cloud-product',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
    } as Prisma.InputJsonValue,
    linkCreate: async (systemId, productId) => {
      await prisma.systemPublicCloudProductLink.create({
        data: {
          systemId,
          publicCloudProductId: productId,
        },
      });
    },
  });
}

export async function createSystemFromPrivateCloudProduct(
  product: PrivateCloudProduct & {
    cluster: PrivateCloudProduct['cluster'];
    golddrEnabled: boolean;
    resourceRequests: PrivateCloudProduct['resourceRequests'];
    supportPhoneNumber: string | null;
    members: PrivateCloudProduct['members'];
    projectOwnerId: string;
    primaryTechnicalLeadId: string;
    secondaryTechnicalLeadId: string | null;
    isTest: boolean;
    temporaryProductNotificationDate: Date | null;
  },
) {
  return createSystemAndLink({
    product,
    sourceModel: 'PrivateCloudProduct',
    sourceType: 'private-cloud-product',
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
        cluster: product.cluster,
        status: product.status,
        organizationId: product.organizationId,
        projectOwnerId: product.projectOwnerId,
        primaryTechnicalLeadId: product.primaryTechnicalLeadId,
        secondaryTechnicalLeadId: product.secondaryTechnicalLeadId,
        resourceRequests: product.resourceRequests,
        supportPhoneNumber: product.supportPhoneNumber,
        golddrEnabled: product.golddrEnabled,
        members: product.members,
        isTest: product.isTest,
        temporaryProductNotificationDate: product.temporaryProductNotificationDate?.toISOString() ?? null,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        archivedAt: product.archivedAt?.toISOString() ?? null,
      },
    } as Prisma.InputJsonValue,
    mappings: {
      sourceRecords: [
        {
          type: 'private-cloud-product',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
      resourceLinks: [
        {
          type: 'private-cloud-product',
          id: product.id,
          licencePlate: product.licencePlate,
        },
      ],
    } as Prisma.InputJsonValue,
    linkCreate: async (systemId, productId) => {
      await prisma.systemPrivateCloudProductLink.create({
        data: {
          systemId,
          privateCloudProductId: productId,
        },
      });
    },
  });
}
