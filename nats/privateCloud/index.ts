import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  snapshot,
} from '@/nats/privateCloud/constants';
import { Prisma, PrivateCloudRequest, RequestType } from '@prisma/client';

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
  switch (ministry.toLocaleLowerCase()) {
    case 'ag':
    case 'pssg':
    case 'embc':
    case 'mah':
      allianceLabel = 'JAG';
      break;
    default:
      allianceLabel = 'none';
      break;
  }

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
        cpu: DefaultCpuOptions[quota.cpu].name,
        memory: DefaultMemoryOptions[quota.memory].name,
        storage: DefaultStorageOptions[quota.storage].name,
        snapshot: snapshot.name,
      },
      quotas: {
        cpu: { requests: DefaultCpuOptions[quota.cpu].cpuRequests, limits: DefaultCpuOptions[quota.cpu].cpuLimits },
        memory: {
          requests: DefaultMemoryOptions[quota.memory].memoryRequests,
          limits: DefaultMemoryOptions[quota.memory].memoryLimits,
        },
        storage: {
          block: DefaultStorageOptions[quota.storage].storageBlock,
          file: DefaultStorageOptions[quota.storage].storageFile,
          backup: DefaultStorageOptions[quota.storage].storageBackup,
          capacity: DefaultStorageOptions[quota.storage].storageCapacity,
          pvc_count: DefaultStorageOptions[quota.storage].storagePvcCount,
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
