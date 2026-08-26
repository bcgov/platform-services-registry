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

type UnmatchedMoneyFields = {
  amountCad: number;
  sourceCurrency?: string;
  fxRate?: number;
  fxRateDate?: Date;
};

function sameUnmatchedMoney(current: UnmatchedMoneyFields, next: UnmatchedMoneyFields) {
  return (
    current.amountCad === next.amountCad &&
    (current.sourceCurrency ?? '') === (next.sourceCurrency ?? '') &&
    (current.fxRate ?? null) === (next.fxRate ?? null) &&
    (current.fxRateDate?.getTime() ?? null) === (next.fxRateDate?.getTime() ?? null)
  );
}

export function planUnmatchedReconcile<
  TExisting extends UnmatchedLineKeyParts & UnmatchedMoneyFields & { id: string; resolvedTo?: string | null },
  TNext extends UnmatchedLineKeyParts & UnmatchedMoneyFields,
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
      if (!current || sameUnmatchedMoney(current, line)) return [];
      return [
        {
          id: current.id,
          amountCad: line.amountCad,
          sourceCurrency: line.sourceCurrency,
          fxRate: line.fxRate,
          fxRateDate: line.fxRateDate,
        },
      ];
    }),
  };
}
