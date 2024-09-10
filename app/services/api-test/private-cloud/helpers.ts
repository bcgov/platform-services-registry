import { DecisionStatus } from '@prisma/client';
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
  const requestData = createSamplePrivateCloudProductData();
  await mockSessionByEmail(requestData.projectOwner.email);

  let response = await createPrivateCloudProject(requestData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole('admin');

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
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
    memory: MemoryQuotaEnum.enum.MEMORY_REQUEST_4_LIMIT_8,
    storage: StorageQuotaEnum.enum.STORAGE_2,
  };

  const productData = createSamplePrivateCloudProductData({
    data: {
      developmentQuota: oldDevelopmentQuota,
    },
  });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole('admin');

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
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

  await mockSessionByRole('admin');

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
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
  const productData = createSamplePrivateCloudProductData({});

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole('admin');

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
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

  await mockSessionByRole('admin');

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  response = await provisionPrivateCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}
