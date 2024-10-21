import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';
import _mapValues from 'lodash-es/mapValues';
import _pick from 'lodash-es/pick';
import { ministryOptions } from '@/constants';
import { extractNumbers } from '@/utils/string';

export function ministryKeyToName(key: string) {
  return ministryOptions.find((item) => item.value === key)?.label ?? '';
}

interface Member {
  email: string;
}
interface ProductWithMembers {
  projectOwner: Member;
  primaryTechnicalLead: Member;
  secondaryTechnicalLead: Member | null;
}

export function hasContactsChanged(product1?: ProductWithMembers | null, product2?: ProductWithMembers | null) {
  if (!product1 || !product2) return false;

  return (
    product1.projectOwner.email.toLowerCase() !== product2.projectOwner.email.toLowerCase() ||
    product1.primaryTechnicalLead.email.toLowerCase() !== product2.primaryTechnicalLead.email.toLowerCase() ||
    product1.secondaryTechnicalLead?.email.toLowerCase() !== product2.secondaryTechnicalLead?.email.toLowerCase()
  );
}

type ResourceObject = {
  type?: 'cpu' | 'memory' | 'storage';
  storage?: number;
  memoryRequest?: number;
  memoryLimit?: number;
  cpuRequest?: number;
  cpuLimit?: number;
};

export function parseResourceString(resource: string): ResourceObject {
  const resourceObject: ResourceObject = {};

  const storagePattern = /^STORAGE_(\d+)$/;
  const memoryPattern = /^MEMORY_REQUEST_(\d+)_LIMIT_(\d+)$/;
  const cpuPattern = /^CPU_REQUEST_(\d+_?\d*)_LIMIT_(\d+_?\d*)$/;
  let match: RegExpMatchArray | null;
  if ((match = resource.match(storagePattern))) {
    resourceObject.storage = parseInt(match[1], 10);
    resourceObject.type = 'storage';
  } else if ((match = resource.match(memoryPattern))) {
    resourceObject.memoryRequest = parseInt(match[1], 10);
    resourceObject.memoryLimit = parseInt(match[2], 10);
    resourceObject.type = 'memory';
  } else if ((match = resource.match(cpuPattern))) {
    resourceObject.cpuRequest = parseFloat(match[1].replace('_', '.'));
    resourceObject.cpuLimit = parseFloat(match[2].replace('_', '.'));
    resourceObject.type = 'cpu';
  }

  return resourceObject;
}

export function pickProductData(data: any, fields: string[]) {
  const picked = _pick(data, fields);

  if (picked.projectOwner) {
    picked.projectOwner = { email: picked.projectOwner.email };
  }

  if (picked.primaryTechnicalLead) {
    picked.primaryTechnicalLead = { email: picked.primaryTechnicalLead.email };
  }

  if (picked.secondaryTechnicalLead) {
    picked.secondaryTechnicalLead = { email: picked.secondaryTechnicalLead.email };
  }

  if (picked.expenseAuthority) {
    picked.expenseAuthority = { email: picked.expenseAuthority.email };
  }
}

export function getTotalQuota(...quotaValues: string[]) {
  let total = 0;
  _forEach(quotaValues, (val) => {
    const nums = extractNumbers(val);
    if (nums.length > 0) total += nums[0];
  });

  return total;
}

export const getTotalQuotaStr = (...values: string[]) => String(getTotalQuota(...values));
