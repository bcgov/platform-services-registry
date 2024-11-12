import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';
import _mapValues from 'lodash-es/mapValues';
import _pick from 'lodash-es/pick';
import _uniq from 'lodash-es/uniq';
import { ExtendedPrivateCloudProductMember } from '@/types/private-cloud';
import { ExtendedPublicCloudProductMember } from '@/types/public-cloud';
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
  'members',
  'developmentQuota',
  'testQuota',
  'productionQuota',
  'toolsQuota',
  'commonComponents',
  'supportPhoneNumber',
];

function preparePrivateCloudProductCloudData(data: any) {
  if (data.members) {
    data.members = data.members.map((member: ExtendedPrivateCloudProductMember) => ({
      email: member.email,
      roles: (member.roles || []).join(', '),
    }));
  }

  return data;
}

export function comparePrivateProductData(data1: any, data2: any) {
  data1 = preparePrivateCloudProductCloudData({ ...data1 });
  data2 = preparePrivateCloudProductCloudData({ ...data2 });

  const changes = diffExt(data1, data2, privateDataFields);
  const parentPaths = [];

  let profileChanged = false;
  let contactsChanged = false;
  let membersChanged = false;
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

      case 'members':
        membersChanged = true;
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
    membersChanged,
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
  membersChanged: boolean;
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
  'members',
];

function preparePublicCloudProductCloudData(data: any) {
  if (data.members) {
    data.members = data.members.map((member: ExtendedPublicCloudProductMember) => ({
      email: member.email,
      roles: (member.roles || []).join(', '),
    }));
  }

  return data;
}

export function comparePublicProductData(data1: any, data2: any) {
  data1 = preparePublicCloudProductCloudData({ ...data1 });
  data2 = preparePublicCloudProductCloudData({ ...data2 });

  const changes = diffExt(data1, data2, publicDataFields);
  const parentPaths = [];

  let profileChanged = false;
  let contactsChanged = false;
  let budgetChanged = false;
  let billingChanged = false;
  let membersChanged = false;

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
      case 'expenseAuthority':
        contactsChanged = true;
        break;

      case 'members':
        membersChanged = true;
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
    membersChanged,
    budgetChanged,
    billingChanged,
    parentPaths: _uniq(parentPaths),
    changes,
  };
}
