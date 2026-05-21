'use client';

import { Badge } from '@mantine/core';
import { Prisma } from '@/prisma/client';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function getConsolidationState(metadata?: Prisma.JsonValue | null) {
  if (!isObjectRecord(metadata)) return '';

  if (isObjectRecord(metadata.consolidatedInto)) {
    return 'replaced';
  }

  if (isObjectRecord(metadata.consolidation)) {
    return 'consolidated';
  }

  return '';
}

export default function ConsolidationBadge({ metadata }: { metadata?: Prisma.JsonValue | null }) {
  const state = getConsolidationState(metadata);

  if (state === 'replaced') {
    return (
      <Badge color="orange" variant="light">
        Replaced
      </Badge>
    );
  }

  if (state === 'consolidated') {
    return (
      <Badge color="teal" variant="light">
        Consolidated
      </Badge>
    );
  }

  return null;
}
