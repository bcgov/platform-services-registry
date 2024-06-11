import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudRequestData } from '@/helpers/mock-resources';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const fieldsToCompare = [
  'name',
  'description',
  'cluster',
  'ministry',
  'projectOwner',
  'primaryTechnicalLead',
  'secondaryTechnicalLead',
  'developmentQuota',
  'testQuota',
  'productionQuota',
  'toolsQuota',
  'commonComponents',
];

const requestDataSet = {
  a: createSamplePrivateCloudRequestData(),
  b: createSamplePrivateCloudRequestData(),
};

const requestDocSet = {
  a: null as any,
  b: null as any,
};

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Review Private Cloud Request - Permissions', () => {
  it('should successfully create a request for PO requester', async () => {
    await mockSessionByEmail(requestDataSet.a.projectOwner.email);

    const response = await createPrivateCloudProject(requestDataSet.a);
    expect(response.status).toBe(200);

    requestDocSet.a = await response.json();
    const decisionData = requestDocSet.a.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestDataSet.a, fieldsToCompare));
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const response = await makePrivateCloudRequestDecision(
      { ...requestDocSet.a.decisionData, decision: $Enums.DecisionStatus.APPROVED },
      { pathParams: { id: requestDocSet.a.id } },
    );
    expect(response.status).toBe(401);
  });

  it('should fail to review a request for PO requester', async () => {
    await mockSessionByEmail(requestDataSet.a.projectOwner.email);

    const response = await makePrivateCloudRequestDecision(
      { ...requestDocSet.a.decisionData, decision: $Enums.DecisionStatus.APPROVED },
      { pathParams: { id: requestDocSet.a.id } },
    );

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review a request for global admin requester', async () => {
    await mockSessionByRole('admin');

    const response = await makePrivateCloudRequestDecision(
      { ...requestDocSet.a.decisionData, decision: $Enums.DecisionStatus.APPROVED },
      { pathParams: { id: requestDocSet.a.id } },
    );

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(
      pickProductData(requestDocSet.a.decisionData, fieldsToCompare),
    );
  });

  it('should fail to review a request already reviewed', async () => {
    await mockSessionByRole('admin');

    const response = await makePrivateCloudRequestDecision(
      { ...requestDocSet.a.decisionData, decision: $Enums.DecisionStatus.APPROVED },
      { pathParams: { id: requestDocSet.a.id } },
    );

    expect(response.status).toBe(500);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });
});

describe('Review Private Cloud Request - Validations', () => {
  it('should successfully create a request for PO requester', async () => {
    await mockSessionByEmail(requestDataSet.b.projectOwner.email);

    const response = await createPrivateCloudProject(requestDataSet.b);
    expect(response.status).toBe(200);

    requestDocSet.b = await response.json();
    const decisionData = requestDocSet.b.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestDataSet.b, fieldsToCompare));
  });

  it('should ignore the cluster change', async () => {
    await mockSessionByRole('admin');

    const newName = requestDocSet.b.decisionData.name + '_suffix';
    const newCluster =
      requestDataSet.b.cluster === $Enums.Cluster.SILVER ? $Enums.Cluster.EMERALD : $Enums.Cluster.SILVER;

    const response = await makePrivateCloudRequestDecision(
      {
        ...requestDocSet.b.decisionData,
        name: newName,
        cluster: newCluster,
        decision: $Enums.DecisionStatus.APPROVED,
      },
      { pathParams: { id: requestDocSet.b.id } },
    );

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(decisionData.name).toBe(newName);
    expect(decisionData.cluster).toBe(requestDataSet.b.cluster);
  });
});
