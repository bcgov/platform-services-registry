import { diff } from 'just-diff';
import _get from 'lodash-es/get';
import _isString from 'lodash-es/isString';
import _mapValues from 'lodash-es/mapValues';
import _pick from 'lodash-es/pick';
import { ministryOptions } from '@/constants';
import { isEmail } from '@/utils/string';

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

function pickData(data: any, fields: string[]) {
  return _mapValues(_pick(data || {}, fields), (val, key) => {
    if (_isString(val) && isEmail(val)) return val.toLowerCase();
    return val;
  });
}

export type ProductChangeValueFormatter = ((resource: string) => ResourceObject) | null;
export type ProductChangeValueFormatterKey = 'resource' | '';

export interface ProductChange {
  profileChanged: boolean;
  contactsChanged: boolean;
  quotasChanged: boolean;
  compChanged: boolean;
  changes: {
    path: (string | number)[];
    loc: string;
    formatterKey: ProductChangeValueFormatterKey;
    oldVal: any;
    newVal: any;
  }[];
}

export function diffProductData(data1: any, data2: any, fields: string[]) {
  const d1 = pickData(data1, fields);
  const d2 = pickData(data2, fields);
  return diff(d1, d2);
}

const privateDataFields = [
  'name',
  'description',
  'ministry',
  'golddrEnabled',
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
  const dffs = diffProductData(data1, data2, privateDataFields);

  let profileChanged = false;
  let contactsChanged = false;
  let quotasChanged = false;
  let compChanged = false;

  const changes = [];

  for (const dff of dffs) {
    if (dff.op !== 'replace') continue;

    let formatterKey: ProductChangeValueFormatterKey = '';

    switch (dff.path[0]) {
      case 'name':
      case 'description':
      case 'ministry':
      case 'golddrEnabled':
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
        formatterKey = 'resource';
        break;

      case 'commonComponents':
        compChanged = true;
        break;
    }

    changes.push({
      path: dff.path,
      loc: dff.path.join('.'),
      formatterKey,
      oldVal: _get(data1, dff.path, null),
      newVal: dff.value,
    });
  }

  const sortedChanges = changes.sort((a, b) => {
    const indexA = privateDataFields.indexOf(a.path[0].toString());
    const indexB = privateDataFields.indexOf(b.path[0].toString());
    return indexA - indexB;
  });

  return {
    profileChanged,
    contactsChanged,
    quotasChanged,
    compChanged,
    changes: sortedChanges,
  };
}
