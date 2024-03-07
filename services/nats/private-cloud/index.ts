import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  snapshot,
  DefaultCpuOptionsKey,
  DefaultMemoryOptionsKey,
  DefaultStorageOptionsKey,
} from '@/services/nats/private-cloud/constants';
import { $Enums, Prisma, PrivateCloudRequest, RequestType } from '@prisma/client';

export type PrivateCloudRequestedProjectWithContacts = Prisma.PrivateCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

export default function createPrivateCloudNatsMessage(
  requestId: PrivateCloudRequest['id'],
  requestType: RequestType,
  requestedProject: PrivateCloudRequestedProjectWithContacts,
  contactChanged: boolean,
) {
  const {
    id,
    licencePlate,
    name,
    description,
    ministry,
    cluster,
    productionQuota,
    developmentQuota,
    testQuota,
    toolsQuota,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
  } = requestedProject;

  let allianceLabel = '';
  switch (ministry) {
    case $Enums.Ministry.AG:
    case $Enums.Ministry.EMBC:
    case $Enums.Ministry.HOUS:
    case $Enums.Ministry.MAH:
    case $Enums.Ministry.PSSG:
      allianceLabel = 'JAG';
      break;
    default:
      allianceLabel = 'none';
      break;
  }

  console.log('allianceLabelallianceLabelministry', ministry, allianceLabel);

  const messageBody = {
    action: requestType.toLocaleLowerCase(),
    profile_id: id,
    licencePlate: licencePlate,
    isContactChanged: contactChanged,
    workflow: `${cluster.toLocaleLowerCase()}-${licencePlate}-${requestId}`,
    cluster_name: cluster.toLocaleLowerCase(),
    display_name: name,
    description: description,
    ministry_id: ministry,
    merge_type: 'auto',
    alliance: allianceLabel,
    namespaces: [
      { quotaName: 'tools', quota: toolsQuota },
      { quotaName: 'prod', quota: productionQuota },
      { quotaName: 'dev', quota: developmentQuota },
      { quotaName: 'test', quota: testQuota },
    ].map(({ quotaName, quota }) => ({
      name: `${licencePlate}-${quotaName}`,
      quota: {
        cpu: DefaultCpuOptions[quota.cpu as DefaultCpuOptionsKey].name,
        memory: DefaultMemoryOptions[quota.memory as DefaultMemoryOptionsKey].name,
        storage: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].name,
        snapshot: snapshot.name,
      },
      quotas: {
        cpu: {
          requests: DefaultCpuOptions[quota.cpu as DefaultCpuOptionsKey].cpuRequests,
          limits: DefaultCpuOptions[quota.cpu as DefaultCpuOptionsKey].cpuLimits,
        },
        memory: {
          requests: DefaultMemoryOptions[quota.memory as DefaultMemoryOptionsKey].memoryRequests,
          limits: DefaultMemoryOptions[quota.memory as DefaultMemoryOptionsKey].memoryLimits,
        },
        storage: {
          block: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].storageBlock,
          file: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].storageFile,
          backup: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].storageBackup,
          capacity: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].storageCapacity,
          pvc_count: DefaultStorageOptions[quota.storage as DefaultStorageOptionsKey].storagePvcCount,
        },
        snapshot: { count: snapshot.snapshotCount },
      },
    })),
    contacts: [
      {
        email: projectOwner.email,
        idir: projectOwner.idir,
        upn: projectOwner.upn,
        role: 'owner',
      },
      {
        email: primaryTechnicalLead.email,
        idir: primaryTechnicalLead.idir,
        upn: primaryTechnicalLead.upn,
        role: 'lead',
      },
      secondaryTechnicalLead
        ? {
            email: secondaryTechnicalLead.email,
            idir: secondaryTechnicalLead.idir,
            upn: secondaryTechnicalLead.upn,
            role: 'lead',
          }
        : null,
    ].filter(Boolean),
  };

  return messageBody;
}
