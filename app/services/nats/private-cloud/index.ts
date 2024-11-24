import { Ministry, ResourceRequestsEnv } from '@prisma/client';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

type ResourceRequestsEnvKeys = Array<keyof ResourceRequestsEnv>;
const namespaceKeys: ResourceRequestsEnvKeys = ['development', 'test', 'production', 'tools'];

const namespaceAbbr = {
  development: 'dev',
  test: 'test',
  production: 'prod',
  tools: 'tools',
};

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
    resourceRequests,
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
    namespaces: namespaceKeys.map((namespace) => {
      const requests = resourceRequests[namespace];
      let backupSize = requests.storage / 2;
      const isEmptyStorage = requests.storage === 0;

      if (!isEmptyStorage && backupSize < 1) backupSize = 1;

      return {
        name: `${licencePlate}-${namespaceAbbr[namespace]}`,
        quotas: {
          cpu: {
            requests: requests.cpu,
          },
          memory: {
            requests: `${requests.memory}Gi`,
          },
          storage: {
            block: `${requests.storage}Gi`,
            file: `${requests.storage}Gi`,
            capacity: `${requests.storage}Gi`,
            backup: `${backupSize}Gi`,
            pvc_count: isEmptyStorage ? 0 : 60,
          },
          snapshot: { count: isEmptyStorage ? 0 : 5 },
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
