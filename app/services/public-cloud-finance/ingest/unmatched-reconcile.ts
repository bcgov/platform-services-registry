import type { Provider } from '@/prisma/client';

export type UnmatchedLineKeyParts = {
  provider: Provider;
  accountIdentifier: string;
  serviceLine: string;
  year: number;
  month: number;
};

export function unmatchedLineKey(line: UnmatchedLineKeyParts) {
  return `${line.provider}:${line.accountIdentifier.trim().toLowerCase()}:${line.serviceLine}:${line.year}-${
    line.month
  }`;
}

export function planUnmatchedReconcile<
  TExisting extends UnmatchedLineKeyParts & { id: string; amountCad: number; resolvedTo?: string | null },
  TNext extends UnmatchedLineKeyParts & { amountCad: number },
>(existing: TExisting[], next: TNext[]) {
  const resolvedKeys = new Set(existing.filter((row) => row.resolvedTo).map((row) => unmatchedLineKey(row)));
  const unresolved = existing.filter((row) => !row.resolvedTo);
  const unresolvedByKey = new Map(unresolved.map((row) => [unmatchedLineKey(row), row]));
  const nextKeys = new Set(next.map(unmatchedLineKey));

  return {
    staleIds: unresolved.filter((row) => !nextKeys.has(unmatchedLineKey(row))).map((row) => row.id),
    toCreate: next.filter(
      (line) => !resolvedKeys.has(unmatchedLineKey(line)) && !unresolvedByKey.has(unmatchedLineKey(line)),
    ),
    toUpdate: next.flatMap((line) => {
      const current = unresolvedByKey.get(unmatchedLineKey(line));
      if (!current || current.amountCad === line.amountCad) return [];
      return [{ id: current.id, amountCad: line.amountCad }];
    }),
  };
}
