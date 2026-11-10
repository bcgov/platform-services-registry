import { DecisionStatus, Prisma } from '@/prisma/client';

type RequestWhereInput = Prisma.PrivateCloudRequestWhereInput | Prisma.PublicCloudRequestWhereInput;

export function getRequestStatusFilter<T extends RequestWhereInput>(status: DecisionStatus[]): T {
  const conditions: {
    decisionStatus: DecisionStatus | { in: DecisionStatus[] };
    OR?: { decisionMakerId: null | { isSet: boolean } }[];
    decisionMakerId?: { not: null };
  }[] = [{ decisionStatus: { in: status } }];

  if (status.includes(DecisionStatus.AUTO_APPROVED)) {
    conditions.push({
      decisionStatus: DecisionStatus.PROVISIONED,
      OR: [{ decisionMakerId: null }, { decisionMakerId: { isSet: false } }],
    });
  }

  if (status.includes(DecisionStatus.APPROVED)) {
    conditions.push({
      decisionStatus: DecisionStatus.PROVISIONED,
      decisionMakerId: { not: null },
    });
  }

  return { OR: conditions } as T;
}
