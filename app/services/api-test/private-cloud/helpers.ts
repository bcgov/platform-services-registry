import { Cluster, DecisionStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import {
  createPrivateCloudProject,
  editPrivateCloudProject,
  deletePrivateCloudProject,
} from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { CpuQuotaEnum, MemoryQuotaEnum, StorageQuotaEnum } from '@/validation-schemas/private-cloud';

export async function createPrivateCloudProduct() {
  const requestData = createSamplePrivateCloudProductData({ data: { cluster: Cluster.SILVER } });
  await mockSessionByEmail(requestData.projectOwner.email);

  let response = await createPrivateCloudProject(requestData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}

export async function updatePrivateCloudProduct() {
  const oldDevelopmentQuota = {
    cpu: CpuQuotaEnum.enum.CPU_REQUEST_1_LIMIT_2,
    memory: MemoryQuotaEnum.enum.MEMORY_REQUEST_4_LIMIT_8,
    storage: StorageQuotaEnum.enum.STORAGE_2,
  };

  const newDevelopmentQuota = {
    cpu: CpuQuotaEnum.enum.CPU_REQUEST_1_LIMIT_2,
    memory: MemoryQuotaEnum.enum.MEMORY_REQUEST_8_LIMIT_16,
    storage: StorageQuotaEnum.enum.STORAGE_2,
  };

  const productData = createSamplePrivateCloudProductData({
    data: {
      cluster: Cluster.SILVER,
      developmentQuota: oldDevelopmentQuota,
    },
  });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  response = await editPrivateCloudProject(decisionData.licencePlate, {
    ...decisionData,
    developmentQuota: newDevelopmentQuota,
  });

  if (response.status !== 200) return null;
  resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.EDIT,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}

export async function deletePrivateCloudProduct() {
  const productData = createSamplePrivateCloudProductData({ data: { cluster: Cluster.SILVER } });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  response = await deletePrivateCloudProject(decisionData.licencePlate);

  if (response.status !== 200) return null;
  resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.DELETE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}
