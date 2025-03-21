import { DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProduct } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProduct,
  editPublicCloudProduct,
  deletePublicCloudProduct,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

async function runPublicCloudMouWorkflows(reqData: any) {
  const decisionData = reqData.decisionData;
  const billing = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: reqData.licencePlate, signed: false, approved: false },
  });

  if (!billing) return;

  await mockSessionByEmail(decisionData.expenseAuthority.email);
  let response = await signPublicCloudBilling(reqData.licencePlate, billing.id, {
    accountCoding: billing.accountCoding,
    confirmed: true,
  });

  if (response.status !== 200) return;

  const billing2 = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: reqData.licencePlate, signed: false, approved: false },
  });

  if (!billing2) return;

  await mockSessionByRole(GlobalRole.BillingReviewer);
  response = await reviewPublicCloudBilling(reqData.id, billing2.id, {
    decision: 'APPROVE',
  });
}

async function approveAndProvisionRequest(reqData: any) {
  let decisionData = reqData.decisionData;

  await mockSessionByRole(GlobalRole.PublicReviewer);
  let response = await makePublicCloudRequestDecision(reqData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  const resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.Admin);
  response = await provisionPublicCloudProduct(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}

export async function createPublicCloudProduct() {
  const requestData = createSamplePublicCloudProductData();
  await mockSessionByEmail(requestData.projectOwner.email);

  const response = await createPublicCloudProduct(requestData);
  if (response.status !== 200) return null;

  const resData = await response.json();

  await runPublicCloudMouWorkflows(resData);

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

  let response = await createPublicCloudProduct(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  const decisionData = await approveAndProvisionRequest(resData);

  response = await editPublicCloudProduct(decisionData.licencePlate, {
    ...decisionData,
    environmentsEnabled: newEnvironmentsEnabled,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  return resData.decisionData;
}

export async function deletePublicCloudProduct() {
  const productData = createSamplePublicCloudProductData({});

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPublicCloudProduct(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = await approveAndProvisionRequest(resData);

  response = await deletePublicCloudProduct(decisionData.licencePlate);
  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = await approveAndProvisionRequest(resData);
  return decisionData;
}
