import { $Enums, DecisionStatus, Prisma, RequestType, EventType } from '@prisma/client';
import _toNumber from 'lodash-es/toNumber';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { comparePrivateProductData } from '@/helpers/product-change';
import { isQuotaUpgrade } from '@/helpers/quota-change';
import { createEvent } from '@/mutations/events';
import { getLastClosedPrivateCloudRequest, privateCloudRequestDetailInclude } from '@/queries/private-cloud-requests';
import { upsertUsers } from '@/services/db/user';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';
const tempPodMetric = [
  {
    name: 'mautic-40-j496b',
    usage: { cpu: '0m', memory: '261612Ki' },
    limits: { cpu: '1000m', memory: '2097152Ki' },
    requests: { cpu: '50m', memory: '1048576Ki' },
  },
  {
    name: 'mautic-db-25-w5wpd',
    usage: { cpu: '3m', memory: '1642488Ki' },
    limits: { cpu: '1000m', memory: '2097152Ki' },
    requests: { cpu: '1000m', memory: '2097152Ki' },
  },
  {
    name: 'mautic-db-backup-3-ntbf6',
    usage: { cpu: '0m', memory: '0' },
    limits: { cpu: '0m', memory: '0' },
    requests: { cpu: '0m', memory: '0' },
  },
  {
    name: 'mautic-subscription-api-prod-9-65w4g',
    usage: { cpu: '0m', memory: '23504Ki' },
    limits: { cpu: '1000m', memory: '81920Ki' },
    requests: { cpu: '10m', memory: '40960Ki' },
  },
  {
    name: 'mautic-subscription-api-prod-9-fp2nx',
    usage: { cpu: '0m', memory: '11624Ki' },
    limits: { cpu: '1000m', memory: '81920Ki' },
    requests: { cpu: '10m', memory: '40960Ki' },
  },
  {
    name: 'mautic-subscription-api-prod-9-q7rcl',
    usage: { cpu: '0m', memory: '15160Ki' },
    limits: { cpu: '1000m', memory: '81920Ki' },
    requests: { cpu: '10m', memory: '40960Ki' },
  },
  {
    name: 'mautic-subscription-prod-39-d9hx5',
    usage: { cpu: '0m', memory: '19256Ki' },
    limits: { cpu: '50m', memory: '61440Ki' },
    requests: { cpu: '10m', memory: '30720Ki' },
  },
];

const getNum = (str: string) => _toNumber(str.match(/\d+/));

const totalUsageMemory = tempPodMetric.reduce((sum: number, pod) => sum + getNum(pod.usage.memory), 0);
const totalLimitMemory = tempPodMetric.reduce((sum: number, pod) => sum + getNum(pod.limits.memory), 0);
const totalUsageCPU = tempPodMetric.reduce((sum: number, pod) => sum + getNum(pod.usage.cpu), 0);
const totalLimitCPU = tempPodMetric.reduce((sum: number, pod) => sum + getNum(pod.limits.cpu), 0);

const usageInPercentage = () => {
  // Current Usage in Percentage=( Total Quota Limit/Current Usage)×100
  const currentUsage = (totalLimitMemory / totalUsageMemory) * 100;
  // if Current usage exceeds 85% of the total limit - approve automatically

  // Utilization Rate=( Requested Resources Actual Usage )×100
  const utilizationRate = totalUsageMemory * 100;
  // Utilization rate is at least 35% - approve automatically
};
export default async function editRequest(
  licencePlate: string,
  formData: PrivateCloudEditRequestBody,
  session: Session,
) {
  // Get the current project that we are creating an edit request for
  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate: licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!project) {
    throw new Error('Project does not exist.');
  }

  const { requestComment, quotaContactName, quotaContactEmail, quotaJustification, ...rest } = formData;

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  // merge the form data with the existing project data
  const decisionData = {
    ...rest,
    licencePlate: project.licencePlate,
    status: project.status,
    cluster: project.cluster,
    createdAt: project.createdAt,
    projectOwner: { connect: { email: formData.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: formData.primaryTechnicalLead.email } },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? { connect: { email: formData.secondaryTechnicalLead.email } }
      : undefined,
  };

  // The edit request will require manual admin approval if any of the quotas are being changed.
  const isNoQuotaChanged =
    JSON.stringify(formData.productionQuota) === JSON.stringify(project.productionQuota) &&
    JSON.stringify(formData.testQuota) === JSON.stringify(project.testQuota) &&
    JSON.stringify(formData.developmentQuota) === JSON.stringify(project.developmentQuota) &&
    JSON.stringify(formData.toolsQuota) === JSON.stringify(project.toolsQuota);

  let decisionStatus: DecisionStatus;

  const hasGolddrEnabledChanged =
    project.cluster === $Enums.Cluster.GOLD && project.golddrEnabled !== formData.golddrEnabled;

  // If there is no quota change or no quota upgrade and no golddr flag changes, the request is automatically approved
  if ((isNoQuotaChanged || !isQuotaUpgrade(formData, project)) && !hasGolddrEnabledChanged) {
    decisionStatus = DecisionStatus.APPROVED;
  } else {
    decisionStatus = DecisionStatus.PENDING;
  }

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPrivateCloudRequest(project.licencePlate);

  const { changes, ...otherChangeMeta } = comparePrivateProductData(rest, previousRequest?.decisionData);

  const quotaChangeInfo = isNoQuotaChanged
    ? {}
    : {
        quotaContactName,
        quotaContactEmail,
        quotaJustification,
      };

  const request: PrivateCloudRequestDetail = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus,
      isQuotaChanged: !isNoQuotaChanged,
      ...quotaChangeInfo,
      active: true,
      createdByEmail: session.user.email,
      licencePlate: project.licencePlate,
      requestComment,
      changes: otherChangeMeta,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      decisionData: { create: decisionData },
      requestData: { create: decisionData },
      project: { connect: { licencePlate: project.licencePlate } },
    },
    include: privateCloudRequestDetailInclude,
  });

  if (request) {
    await createEvent(EventType.UPDATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
