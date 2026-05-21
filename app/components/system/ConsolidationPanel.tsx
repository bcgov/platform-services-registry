'use client';

import { Badge } from '@mantine/core';
import Link from 'next/link';
import { Prisma } from '@/prisma/client';

type EntityType = 'system' | 'team';

type Props = {
  entityType: EntityType;
  metadata?: Prisma.JsonValue | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function getSourceRecords(metadata: Prisma.JsonValue | null | undefined, entityType: EntityType) {
  if (!isObjectRecord(metadata)) return [];
  const consolidation = metadata.consolidation;
  if (!isObjectRecord(consolidation)) return [];
  const key = entityType === 'system' ? 'sourceSystems' : 'sourceTeams';
  const sourceRecords = consolidation[key];
  if (!Array.isArray(sourceRecords)) return [];

  return sourceRecords
    .filter(isObjectRecord)
    .map((record) => ({
      id: getString(record.id),
      name: getString(record.name),
      code: getString(record.code),
    }))
    .filter((record): record is { id: string; name: string | null; code: string | null } => !!record.id);
}

function getReplacementRecord(metadata: Prisma.JsonValue | null | undefined, entityType: EntityType) {
  if (!isObjectRecord(metadata)) return null;
  const consolidatedInto = metadata.consolidatedInto;
  if (!isObjectRecord(consolidatedInto)) return null;

  const idKey = entityType === 'system' ? 'systemId' : 'teamId';
  const nameKey = entityType === 'system' ? 'systemName' : 'teamName';
  const codeKey = entityType === 'system' ? 'systemCode' : 'teamCode';

  const id = getString(consolidatedInto[idKey]);
  if (!id) return null;

  return {
    id,
    name: getString(consolidatedInto[nameKey]),
    code: getString(consolidatedInto[codeKey]),
    clusterId: getString(consolidatedInto.clusterId),
    consolidatedAt: getString(consolidatedInto.consolidatedAt),
  };
}

export default function ConsolidationPanel({ entityType, metadata }: Props) {
  const replacement = getReplacementRecord(metadata, entityType);
  const sourceRecords = getSourceRecords(metadata, entityType);

  if (!replacement && sourceRecords.length === 0) return null;

  const pluralLabel = entityType === 'system' ? 'Source Systems' : 'Source Teams';
  const replacementLabel = entityType === 'system' ? 'Replaced By' : 'Replaced By';
  const hrefBase = entityType === 'system' ? '/systems' : '/teams';

  return (
    <section className="space-y-3 rounded-sm border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Consolidation</h2>

      {replacement && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{replacementLabel}</span>
            {replacement.clusterId ? <Badge variant="outline">{replacement.clusterId}</Badge> : null}
          </div>
          <p className="text-sm">
            <Link className="underline" href={`${hrefBase}/${replacement.id}`}>
              {replacement.name ?? replacement.id}
            </Link>
            {replacement.code ? ` (${replacement.code})` : ''}
          </p>
          {replacement.consolidatedAt ? (
            <p className="text-sm text-gray-600">Consolidated at {replacement.consolidatedAt}</p>
          ) : null}
        </div>
      )}

      {sourceRecords.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium">{pluralLabel}</p>
          <ul className="list-disc pl-5">
            {sourceRecords.map((record) => (
              <li key={record.id}>
                <Link className="underline" href={`${hrefBase}/${record.id}`}>
                  {record.name ?? record.id}
                </Link>
                {record.code ? ` (${record.code})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
