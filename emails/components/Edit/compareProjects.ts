import _isEqual from 'lodash/isEqual';

export function compareProjects(project: any, requestedProject: any): { [field: string]: boolean } {
  const fieldsToCompare = [
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
    'commonComponents',
  ];

  const differences: { [field: string]: boolean } = {};

  fieldsToCompare.forEach((field) => {
    differences[field] = !_isEqual(project[field], requestedProject[field]);
  });

  return differences;
}
