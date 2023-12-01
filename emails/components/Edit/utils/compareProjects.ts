import _isEqual from 'lodash/isEqual';
import {
  PrivateCloudProject,
  PrivateCloudRequestedProject,
  PublicCloudProject,
  PublicCloudRequestedProject,
} from '@prisma/client';

function compareProjects(project: any, requestedProject: any, fieldsToCompare: string[]): { [field: string]: boolean } {
  const differences: { [field: string]: boolean } = {};

  fieldsToCompare.forEach((field) => {
    differences[field] = !_isEqual(project[field], requestedProject[field]);
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
  'accountCoding',
  'budget',
];

export function comparePrivateCloudProjects(
  project: PrivateCloudProject,
  requestedProject: PrivateCloudRequestedProject,
): { [field: string]: boolean } {
  return compareProjects(project, requestedProject, privateCloudFieldsToCompare);
}

export function comparePublicCloudProjects(
  project: PublicCloudProject,
  requestedProject: PublicCloudRequestedProject,
): { [field: string]: boolean } {
  return compareProjects(project, requestedProject, publicCloudFieldsToCompare);
}
