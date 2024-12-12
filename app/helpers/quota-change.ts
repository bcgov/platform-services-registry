import { ResourceRequestsEnv } from '@prisma/client';
import { extractNumbers } from '@/utils/js';

export const isResourseDowngrade = (req: string, prod: string) => {
  return extractNumbers(req)[0] < extractNumbers(prod)[0];
};

export const isQuotaUpgrade = (oldval: ResourceRequestsEnv, newval: ResourceRequestsEnv) => {
  return (
    oldval.development.cpu < newval.development.cpu ||
    oldval.development.memory < newval.development.memory ||
    oldval.development.storage < newval.development.storage ||
    oldval.test.cpu < newval.test.cpu ||
    oldval.test.memory < newval.test.memory ||
    oldval.test.storage < newval.test.storage ||
    oldval.production.cpu < newval.production.cpu ||
    oldval.production.memory < newval.production.memory ||
    oldval.production.storage < newval.production.storage ||
    oldval.tools.cpu < newval.tools.cpu ||
    oldval.tools.memory < newval.tools.memory ||
    oldval.tools.storage < newval.tools.storage
  );
};
