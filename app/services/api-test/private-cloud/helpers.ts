import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { resourceRequests1, resourceRequests2 } from '@/helpers/mock-resources/private-cloud-product';
import { Cluster, DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPrivateCloudProduct as createPrivateCloudProductTest,
  editPrivateCloudProduct,
  deletePrivateCloudProduct as deletePrivateCloudProductTest,
} from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';

async function createApprovedPrivateCloudProduct(
  data: NonNullable<Parameters<typeof createSamplePrivateCloudProductData>[0]>['data'],
) {
  const requestData = await createSamplePrivateCloudProductData({ data });

  await mockSessionByIdirGuid(requestData.projectOwner.idirGuid);

  const createResponse = await createPrivateCloudProductTest(requestData);
  if (createResponse.status !== 200) return null;

  const createRequest = await createResponse.json();

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  const approvalResponse = await makePrivateCloudRequestDecision(createRequest.id, {
    ...createRequest.decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  if (approvalResponse.status !== 200) return null;

  const approvedRequest = await approvalResponse.json();

  await mockTeamServiceAccount(['private-admin']);

  const provisionResponse = await provisionPrivateCloudProduct(approvedRequest.decisionData.licencePlate);
  if (provisionResponse.status !== 200) return null;

  return approvedRequest.decisionData;
}

export async function createPrivateCloudProduct() {
  return createApprovedPrivateCloudProduct({
    cluster: Cluster.SILVER,
    notificationEmails: ['cgi-team@example.com', 'support@example.com'],
  });
}

export async function updatePrivateCloudProduct() {
  const initialData = await createApprovedPrivateCloudProduct({
    cluster: Cluster.SILVER,
    resourceRequests: resourceRequests1,
    notificationEmails: ['old-team@example.com'],
  });

  if (!initialData) return null;

  await mockSessionByRole(GlobalRole.PrivateAdmin);

  const editResponse = await editPrivateCloudProduct(initialData.licencePlate, {
    ...initialData,
    isAgMinistry: initialData.organization.isAgMinistry,
    resourceRequests: resourceRequests2,
    notificationEmails: ['cgi-team@example.com', 'support@example.com'],
  });

  if (editResponse.status !== 200) return null;

  const editRequest = await editResponse.json();

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  const approvalResponse = await makePrivateCloudRequestDecision(editRequest.id, {
    ...editRequest.decisionData,
    type: RequestType.EDIT,
    decision: DecisionStatus.APPROVED,
  });

  if (approvalResponse.status !== 200) return null;

  const approvedRequest = await approvalResponse.json();

  await mockTeamServiceAccount(['private-admin']);

  const provisionResponse = await provisionPrivateCloudProduct(approvedRequest.decisionData.licencePlate);
  if (provisionResponse.status !== 200) return null;

  return approvedRequest.decisionData;
}

export async function deletePrivateCloudProduct() {
  const initialData = await createApprovedPrivateCloudProduct({
    cluster: Cluster.SILVER,
    notificationEmails: ['cgi-team@example.com'],
  });

  if (!initialData) return null;

  await mockSessionByRole(GlobalRole.PrivateAdmin);

  const deleteResponse = await deletePrivateCloudProductTest(initialData.licencePlate, 'Test delete comment');

  if (deleteResponse.status !== 200) return null;

  const deleteRequest = await deleteResponse.json();

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  const approvalResponse = await makePrivateCloudRequestDecision(deleteRequest.id, {
    ...deleteRequest.decisionData,
    type: RequestType.DELETE,
    decision: DecisionStatus.APPROVED,
  });

  if (approvalResponse.status !== 200) return null;

  const approvedRequest = await approvalResponse.json();

  await mockTeamServiceAccount(['private-admin']);

  const provisionResponse = await provisionPrivateCloudProduct(approvedRequest.decisionData.licencePlate);
  if (provisionResponse.status !== 200) return null;

  return approvedRequest.decisionData;
}
