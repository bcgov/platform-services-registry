import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { resourceRequests1, resourceRequests2 } from '@/helpers/mock-resources/private-cloud-product';
import { Cluster, DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPrivateCloudProduct as createPrivateCloudProductTest,
  editPrivateCloudProduct,
  deletePrivateCloudProduct as deletePrivateCloudProductTest,
} from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export async function createPrivateCloudProduct() {
  const requestData = await createSamplePrivateCloudProductData({ data: { cluster: Cluster.SILVER } });
  await mockSessionByEmail(requestData.projectOwner.email);

  let response = await createPrivateCloudProductTest(requestData);
  if (response.status !== 200) return null;

  let resData: PrivateCloudRequestDetail = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  await mockTeamServiceAccount(['private-admin']);
  response = await provisionPrivateCloudProduct(decisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionData;
}

export async function updatePrivateCloudProduct() {
  const productData = await createSamplePrivateCloudProductData({
    data: {
      cluster: Cluster.SILVER,
      resourceRequests: resourceRequests1,
    },
  });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProductTest(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  await mockTeamServiceAccount(['private-admin']);
  response = await provisionPrivateCloudProduct(decisionData.licencePlate);
  if (response.status !== 200) return null;

  await mockSessionByRole(GlobalRole.PrivateAdmin);

  response = await editPrivateCloudProduct(decisionData.licencePlate, {
    ...decisionData,
    resourceRequests: resourceRequests2,
  });

  if (response.status !== 200) return null;
  resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.EDIT,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  const decisionResData: PrivateCloudRequestDetail = await response.json();
  const decisionResdecisionData = decisionResData.decisionData;

  await mockTeamServiceAccount(['private-admin']);
  response = await provisionPrivateCloudProduct(decisionResdecisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionResdecisionData;
}

export async function deletePrivateCloudProduct() {
  const productData = await createSamplePrivateCloudProductData({ data: { cluster: Cluster.SILVER } });

  await mockSessionByEmail(productData.projectOwner.email);

  let response = await createPrivateCloudProductTest(productData);
  if (response.status !== 200) return null;

  let resData = await response.json();
  let decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  resData = await response.json();
  decisionData = resData.decisionData;

  await mockTeamServiceAccount(['private-admin']);
  response = await provisionPrivateCloudProduct(decisionData.licencePlate);
  if (response.status !== 200) return null;

  await mockSessionByRole(GlobalRole.PrivateAdmin);
  response = await deletePrivateCloudProductTest(decisionData.licencePlate, 'Test delete comment');

  if (response.status !== 200) return null;
  resData = await response.json();
  decisionData = resData.decisionData;

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  response = await makePrivateCloudRequestDecision(resData.id, {
    ...decisionData,
    type: RequestType.DELETE,
    decision: DecisionStatus.APPROVED,
  });

  if (response.status !== 200) return null;

  const decisionResData: PrivateCloudRequestDetail = await response.json();
  const decisionResdecisionData = decisionResData.decisionData;

  await mockTeamServiceAccount(['private-admin']);
  response = await provisionPrivateCloudProduct(decisionResdecisionData.licencePlate);
  if (response.status !== 200) return null;

  return decisionResdecisionData;
}
