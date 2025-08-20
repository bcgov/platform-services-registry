import { environmentShortNames } from '@/constants';
import prisma from '@/core/prisma';
import { Cluster, PublicCloudProductMemberRole, ResourceRequestsEnv } from '@/prisma/client';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

type ResourceRequestsEnvKeys = Array<keyof ResourceRequestsEnv>;
const namespaceKeys: ResourceRequestsEnvKeys = ['development', 'test', 'production', 'tools'];

export default async function createPrivateCloudNatsMessage(
  request: Pick<PrivateCloudRequestDetail, 'id' | 'type' | 'decisionData'>,
  contactChanged: boolean,
) {
  const {
    id,
    licencePlate,
    name,
    description,
    organization,
    cluster,
    golddrEnabled,
    resourceRequests,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    members,
  } = request.decisionData;

  const subscribers = members.filter(
    (member) => !!member.userId && member.roles.includes(PublicCloudProductMemberRole.SUBSCRIBER),
  );
  const users = await prisma.user.findMany({ where: { id: { in: subscribers.map((user) => user.userId) } } });

  let allianceLabel = '';
  switch (organization.code) {
    case 'AG':
    case 'EMCR':
    case 'HMA':
    case 'PSSG':
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
    golddr_enabled: cluster === Cluster.GOLD && golddrEnabled,
    display_name: name,
    description: description,
    ministry_id: organization.code,
    merge_type: 'auto',
    alliance: allianceLabel,
    namespaces: namespaceKeys.map((namespace) => {
      const requests = resourceRequests[namespace];
      let backupSize = requests.storage / 2;
      const isEmptyStorage = requests.storage === 0;

      if (!isEmptyStorage && backupSize < 1) backupSize = 1;

      return {
        name: `${licencePlate}-${environmentShortNames[namespace]}`,
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
      ...users.map(({ email, idir, upn }) => ({
        email,
        idir,
        upn,
        role: 'subscriber',
      })),
    ].filter(Boolean),
  };

  return messageBody;
}
