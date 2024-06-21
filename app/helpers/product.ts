import _forEach from 'lodash/forEach';
import _get from 'lodash/get';
import _isPlainObject from 'lodash/isPlainObject';
import _isString from 'lodash/isString';
import _mapValues from 'lodash/mapValues';
import _pick from 'lodash/pick';
import { ministryOptions } from '@/constants';
import { diffExt, DiffChange } from '@/utils/diff';
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
  } else if ((match = resource.match(memoryPattern))) {
    resourceObject.memoryRequest = parseInt(match[1], 10);
    resourceObject.memoryLimit = parseInt(match[2], 10);
  } else if ((match = resource.match(cpuPattern))) {
    resourceObject.cpuRequest = parseFloat(match[1].replace('_', '.'));
    resourceObject.cpuLimit = parseFloat(match[2].replace('_', '.'));
  }

  return resourceObject;
}

export interface PrivateProductChange {
  profileChanged: boolean;
  contactsChanged: boolean;
  quotasChanged: boolean;
  commonComponentsChanged: boolean;
  changes: DiffChange[];
  parentPaths: string[];
}

const privateDataFields = [
  'name',
  'description',
  'ministry',
  'golddrEnabled',
  'isTest',
  'projectOwner.email',
  'primaryTechnicalLead.email',
  'secondaryTechnicalLead.email',
  'developmentQuota',
  'testQuota',
  'productionQuota',
  'toolsQuota',
  'commonComponents',
];

export function comparePrivateProductData(data1: any, data2: any) {
  const changes = diffExt(data1, data2, privateDataFields);
  const parentPaths = [];

  let profileChanged = false;
  let contactsChanged = false;
  let quotasChanged = false;
  let commonComponentsChanged = false;

  for (const change of changes) {
    parentPaths.push(String(change.path[0]));

    switch (change.path[0]) {
      case 'name':
      case 'description':
      case 'ministry':
      case 'golddrEnabled':
      case 'isTest':
        profileChanged = true;
        break;

      case 'projectOwner':
      case 'primaryTechnicalLead':
      case 'secondaryTechnicalLead':
        contactsChanged = true;
        break;

      case 'developmentQuota':
      case 'testQuota':
      case 'productionQuota':
      case 'toolsQuota':
        quotasChanged = true;
        change.tag = 'resource';
        break;

      case 'commonComponents':
        commonComponentsChanged = true;
        break;
    }
  }

  return {
    profileChanged,
    contactsChanged,
    quotasChanged,
    commonComponentsChanged,
    parentPaths,
    changes,
  };
}

export interface PublicProductChange {
  profileChanged: boolean;
  contactsChanged: boolean;
  budgetChanged: boolean;
  billingChanged: boolean;
  changes: DiffChange[];
  parentPaths: string[];
}

const publicDataFields = [
  'name',
  'description',
  'ministry',
  'accountCoding',
  'budget',
  'projectOwner.email',
  'primaryTechnicalLead.email',
  'secondaryTechnicalLead.email',
  'expenseAuthority.email',
];

export function comparePublicProductData(data1: any, data2: any) {
  const changes = diffExt(data1, data2, publicDataFields);
  const parentPaths = [];

  let profileChanged = false;
  let contactsChanged = false;
  let budgetChanged = false;
  let billingChanged = false;

  for (const change of changes) {
    parentPaths.push(String(change.path[0]));

    switch (change.path[0]) {
      case 'name':
      case 'description':
      case 'ministry':
        profileChanged = true;
        break;

      case 'projectOwner':
      case 'primaryTechnicalLead':
      case 'secondaryTechnicalLead':
        contactsChanged = true;
        break;

      case 'budget':
        budgetChanged = true;
        break;

      case 'accountCoding':
        billingChanged = true;
        break;
    }
  }

  return {
    profileChanged,
    contactsChanged,
    budgetChanged,
    billingChanged,
    parentPaths,
    changes,
  };
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
