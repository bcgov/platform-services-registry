import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';
import _mapValues from 'lodash-es/mapValues';
import _pick from 'lodash-es/pick';
import _uniq from 'lodash-es/uniq';
import { diffExt, DiffChange } from '@/utils/diff';
import { extractNumbers } from '@/utils/string';

export interface PrivateProductChange {
  profileChanged: boolean;
  contactsChanged: boolean;
  quotasChanged: boolean;
  quotasIncrease: boolean;
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
  'supportPhoneNumber',
];

export function comparePrivateProductData(data1: any, data2: any) {
  const changes = diffExt(data1, data2, privateDataFields);
  const parentPaths = [];

  let profileChanged = false;
  let contactsChanged = false;
  let quotasChanged = false;
  let quotasIncrease = false;
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
        if (!quotasIncrease) {
          const oldvalNums = extractNumbers(change.oldVal);
          const newvalNums = extractNumbers(change.newVal);

          if (newvalNums.length > 0 || oldvalNums.length > 0) {
            quotasIncrease = newvalNums[0] > oldvalNums[0];
          }
        }

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
    quotasIncrease,
    commonComponentsChanged,
    parentPaths: _uniq(parentPaths),
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
    parentPaths: _uniq(parentPaths),
    changes,
  };
}
