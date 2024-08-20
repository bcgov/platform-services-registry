import {
  PrivateCloudProject,
  PrivateCloudRequestedProject,
  PublicCloudProject,
  PublicCloudRequestedProject,
} from '@prisma/client';
import _isEqual from 'lodash/isEqual';

function compareProjects(project: any, decisionData: any, fieldsToCompare: string[]): { [field: string]: boolean } {
  const differences: { [field: string]: boolean } = {};

  fieldsToCompare.forEach((field) => {
    differences[field] = !_isEqual(project[field], decisionData[field]);
  });

  return differences;
}

const privateCloudFieldsToCompare: Array<keyof PrivateCloudProject> = [
  'name',
  'description',
  'ministry',
  'cluster',
  'projectOwnerId',
  'primaryTechnicalLeadId',
  'secondaryTechnicalLeadId',
  'productionQuota',
  'testQuota',
  'developmentQuota',
  'toolsQuota',
];

const publicCloudFieldsToCompare: Array<keyof PublicCloudProject> = [
  'name',
  'description',
  'ministry',
  'provider',
  'projectOwnerId',
  'primaryTechnicalLeadId',
  'secondaryTechnicalLeadId',
  'expenseAuthorityId',
  'billingId',
  'budget',
];

export function comparePrivateCloudProjects(
  project: PrivateCloudProject,
  decisionData: PrivateCloudRequestedProject,
): { [field: string]: boolean } {
  return compareProjects(project, decisionData, privateCloudFieldsToCompare);
}

export function comparePublicCloudProjects(
  project: PublicCloudProject,
  decisionData: PublicCloudRequestedProject,
): { [field: string]: boolean } {
  return compareProjects(project, decisionData, publicCloudFieldsToCompare);
}
