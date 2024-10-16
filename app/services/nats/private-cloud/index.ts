import { Ministry } from '@prisma/client';
import { cpuMetadata, memoryMetadata, storageMetadata } from '@/constants';
import { snapshot } from '@/services/nats/private-cloud/constants';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export default function createPrivateCloudNatsMessage(
  request: Pick<PrivateCloudRequestDetail, 'id' | 'type' | 'decisionData'>,
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
  } = request.decisionData;

  let allianceLabel = '';
  switch (ministry) {
    case Ministry.AG:
    case Ministry.EMBC:
    case Ministry.HOUS:
    case Ministry.MAH:
    case Ministry.PSSG:
      allianceLabel = 'JAG';
      break;
    default:
      allianceLabel = 'none';
      break;
  }

  const messageBody = {
    action: request.type.toLocaleLowerCase(),
    profile_id: id,
    licencePlate: licencePlate,
    isContactChanged: contactChanged,
    workflow: `${cluster.toLocaleLowerCase()}-${licencePlate}-${request.id}`,
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
    ].map(({ quotaName, quota }) => {
      const cpuMeta = cpuMetadata[quota.cpu];
      const memoryMeta = memoryMetadata[quota.memory];
      const storageMeta = storageMetadata[quota.storage];
      let backupSize = storageMeta.size / 2;
      if (backupSize < 1) backupSize = 1;

      return {
        name: `${licencePlate}-${quotaName}`,
        quota: {
          cpu: cpuMeta.labelNats,
          memory: memoryMeta.labelNats,
          storage: storageMeta.labelNats,
          snapshot: snapshot.name,
        },
        quotas: {
          cpu: {
            requests: cpuMeta.request,
            limits: cpuMeta.limit,
          },
          memory: {
            requests: `${cpuMeta.request}Gi`,
            limits: `${cpuMeta.limit}Gi`,
          },
          storage: {
            block: `${storageMeta.size}Gi`,
            file: `${storageMeta.size}Gi`,
            backup: `${backupSize}Gi`,
            capacity: `${storageMeta.size}Gi`,
            pvc_count: 60,
          },
          snapshot: { count: snapshot.snapshotCount },
        },
      };
    }),
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
