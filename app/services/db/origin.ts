import { EntityOriginKind, Prisma } from '@/prisma/client';

type OriginDisplay = {
  originKind: EntityOriginKind;
  originLabel: string;
  originSummary: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function getOriginLabel(originKind: EntityOriginKind) {
  switch (originKind) {
    case EntityOriginKind.BOOTSTRAPPED_FROM_PUBLIC_CLOUD_PRODUCT:
      return 'Public Product Bootstrap';
    case EntityOriginKind.BOOTSTRAPPED_FROM_PRIVATE_CLOUD_PRODUCT:
      return 'Private Product Bootstrap';
    case EntityOriginKind.CONSOLIDATED_FROM_SYSTEM_CLUSTER:
      return 'System Consolidation';
    case EntityOriginKind.CONSOLIDATED_FROM_TEAM_CLUSTER:
      return 'Team Consolidation';
    case EntityOriginKind.IMPORTED_OTHER:
      return 'Imported';
    case EntityOriginKind.MANUAL:
    default:
      return 'Manual';
  }
}

function deriveSummary(originKind: EntityOriginKind, metadata?: Prisma.JsonValue | null) {
  if (!isObjectRecord(metadata)) {
    return getOriginLabel(originKind);
  }

  const provenance = metadata.provenance;
  if (isObjectRecord(provenance)) {
    const source = provenance.source;
    if (isObjectRecord(source)) {
      const model = typeof source.model === 'string' ? source.model : null;
      const licencePlate = typeof source.licencePlate === 'string' ? source.licencePlate : null;
      if (model && licencePlate) {
        return `${getOriginLabel(originKind)} from ${model} ${licencePlate}`;
      }
      if (model) {
        return `${getOriginLabel(originKind)} from ${model}`;
      }
    }
  }

  const consolidation = metadata.consolidation;
  if (isObjectRecord(consolidation)) {
    const clusterId = typeof consolidation.clusterId === 'string' ? consolidation.clusterId : null;
    if (clusterId) {
      return `${getOriginLabel(originKind)} via ${clusterId}`;
    }
  }

  return getOriginLabel(originKind);
}

export function deriveFallbackOriginKind(
  metadata: Prisma.JsonValue | null | undefined,
  entityType: 'system' | 'team',
): EntityOriginKind {
  if (!isObjectRecord(metadata)) return EntityOriginKind.MANUAL;

  const consolidation = metadata.consolidation;
  if (isObjectRecord(consolidation)) {
    return entityType === 'system'
      ? EntityOriginKind.CONSOLIDATED_FROM_SYSTEM_CLUSTER
      : EntityOriginKind.CONSOLIDATED_FROM_TEAM_CLUSTER;
  }

  const provenance = metadata.provenance;
  if (isObjectRecord(provenance)) {
    const importedFrom = provenance.importedFrom;
    if (importedFrom === 'public-cloud-product') {
      return EntityOriginKind.BOOTSTRAPPED_FROM_PUBLIC_CLOUD_PRODUCT;
    }
    if (importedFrom === 'private-cloud-product') {
      return EntityOriginKind.BOOTSTRAPPED_FROM_PRIVATE_CLOUD_PRODUCT;
    }
    return EntityOriginKind.IMPORTED_OTHER;
  }

  return EntityOriginKind.MANUAL;
}

export function getSystemOriginDisplay(system: {
  originKind?: EntityOriginKind | null;
  metadata?: Prisma.JsonValue | null;
}): OriginDisplay {
  const originKind = system.originKind ?? deriveFallbackOriginKind(system.metadata, 'system');
  return {
    originKind,
    originLabel: getOriginLabel(originKind),
    originSummary: deriveSummary(originKind, system.metadata),
  };
}

export function getTeamOriginDisplay(team: {
  originKind?: EntityOriginKind | null;
  metadata?: Prisma.JsonValue | null;
}): OriginDisplay {
  const originKind = team.originKind ?? deriveFallbackOriginKind(team.metadata, 'team');
  return {
    originKind,
    originLabel: getOriginLabel(originKind),
    originSummary: deriveSummary(originKind, team.metadata),
  };
}
