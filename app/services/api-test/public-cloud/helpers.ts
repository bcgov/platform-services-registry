import { DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  editPublicCloudProject,
  deletePublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

async function runEmouWorkflows(reqData: any) {
  const decisionData = reqData.decisionData;
  await mockSessionByEmail(decisionData.expenseAuthority.email);

  let task = await prisma.task.findFirst({
    where: {
      type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
      status: TaskStatus.ASSIGNED,
      data: {
        equals: {
          licencePlate: reqData.licencePlate,
        },
      },
    },
  });

  if (!task) return;

  let response = await signPublicCloudMou(reqData.id, {
    taskId: task.id,
    confirmed: true,
  });

  if (response.status !== 200) return;

  await mockSessionByRole(GlobalRole.BillingReviewer);

  task = await prisma.task.findFirst({
    where: {
      type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
      status: TaskStatus.ASSIGNED,
      data: {
        equals: {
          licencePlate: reqData.licencePlate,
        },
      },
    },
  });

  if (!task) return;

  response = await reviewPublicCloudMou(reqData.id, {
    taskId: task.id,
    decision: 'APPROVE',
  });
}

async function approveAndProvisionRequest(reqData: any) {
  let decisionData = reqData.decisionData;

  await mockSessionByRole(GlobalRole.PublicReviewer);
  let response = await makePublicCloudRequestDecision(reqData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    accountCoding: decisionData.billing.accountCoding,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  const resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);
  response = await provisionPublicCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}

export async function createPublicCloudProduct() {
  const requestData = createSamplePublicCloudProductData();
  await mockSessionByEmail(requestData.projectOwner.email);

  const response = await createPublicCloudProject(requestData);
  if (response.status !== 200) return null;

  const resData = await response.json();

  await runEmouWorkflows(resData);

  const decisionData = await approveAndProvisionRequest(resData);
  return decisionData;
}

export async function updatePublicCloudProduct() {
  const oldEnvironmentsEnabled = {
    production: true,
    test: false,
    development: false,
    tools: false,
  };

  const newEnvironmentsEnabled = {
    production: true,
    test: true,
    development: false,
    tools: true,
  };

  const productData = createSamplePublicCloudProductData({
    data: {
      environmentsEnabled: oldEnvironmentsEnabled,
    },
  });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPublicCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  const decisionData = await approveAndProvisionRequest(resData);

  response = await editPublicCloudProject(decisionData.licencePlate, {
    ...decisionData,
    accountCoding: decisionData.billing.accountCoding,
    environmentsEnabled: newEnvironmentsEnabled,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  return resData.decisionData;
}

export async function deletePublicCloudProduct() {
  const productData = createSamplePublicCloudProductData({});

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPublicCloudProject(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = await approveAndProvisionRequest(resData);

  response = await deletePublicCloudProject(decisionData.licencePlate);
  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = await approveAndProvisionRequest(resData);
  return decisionData;
}
