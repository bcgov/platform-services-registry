import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByRole, mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import { searchPrivateCloudRequestsApi } from '@/services/api-test/v1/private-cloud/requests';

async function createTestRequest() {
  await mockSessionByRole(GlobalRole.Admin);

  const res = await createPrivateCloudProduct(createSamplePrivateCloudProductData());

  expect(res.status).toBe(200);

  return res.json();
}

describe('API: v1 Private Cloud Request Search', () => {
  it('should allow an authorized service account to search requests', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({
      page: 1,
      pageSize: 10,
    });

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(typeof data.totalCount).toBe('number');
    expect(data.data.length).toBeLessThanOrEqual(10);

    expect(data.pagination).toEqual({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
    });
  });

  it('should reject a service account without the required role', async () => {
    await mockTeamServiceAccount([]);

    const res = await searchPrivateCloudRequestsApi();

    expect(res.status).toBe(401);
  });

  it('should reject invalid pagination', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({
      page: 1,
      pageSize: 101,
    });

    expect(res.status).toBe(400);
  });

  it('should filter requests by type', async () => {
    const createdRequest = await createTestRequest();

    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({
      licencePlate: createdRequest.licencePlate,
      types: [RequestType.CREATE],
    });

    expect(res.status).toBe(200);

    const result = await res.json();

    expect(result.success).toBe(true);

    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdRequest.id,
          type: RequestType.CREATE,
        }),
      ]),
    );

    expect(result.data.every((request: { type: RequestType }) => request.type === RequestType.CREATE)).toBe(true);
  });

  it('should include auto-approved provisioned requests but exclude manually approved ones', async () => {
    const autoApproved = await createTestRequest();
    const manuallyApproved = await createTestRequest();

    const manualRequest = await prisma.privateCloudRequest.findUniqueOrThrow({
      where: { id: manuallyApproved.id },
      select: { createdById: true },
    });

    await prisma.privateCloudRequest.update({
      where: { id: autoApproved.id },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        decisionMakerId: null,
      },
    });

    await prisma.privateCloudRequest.update({
      where: { id: manuallyApproved.id },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        decisionMakerId: manualRequest.createdById,
      },
    });

    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({
      types: [RequestType.CREATE],
      status: [DecisionStatus.AUTO_APPROVED],
      pageSize: 100,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    const ids = data.data.map((request: { id: string }) => request.id);

    expect(ids).toContain(autoApproved.id);
    expect(ids).not.toContain(manuallyApproved.id);
  });

  it('should paginate requests and preserve totalCount', async () => {
    await createTestRequest();
    await createTestRequest();

    await mockTeamServiceAccount(['private-admin']);

    const firstRes = await searchPrivateCloudRequestsApi({
      types: [RequestType.CREATE],
      page: 1,
      pageSize: 1,
      sortKey: 'createdAt',
      sortOrder: 'desc',
    });

    const secondRes = await searchPrivateCloudRequestsApi({
      types: [RequestType.CREATE],
      page: 2,
      pageSize: 1,
      sortKey: 'createdAt',
      sortOrder: 'desc',
    });

    const first = await firstRes.json();
    const second = await secondRes.json();

    expect(first.data).toHaveLength(1);
    expect(second.data).toHaveLength(1);
    expect(first.totalCount).toBeGreaterThanOrEqual(2);
    expect(second.totalCount).toBe(first.totalCount);
    expect(first.data[0].id).not.toBe(second.data[0].id);

    expect(first.pagination.skip).toBe(0);
    expect(second.pagination.skip).toBe(1);
  });

  it('should reject requests without a bearer token', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({}, false);

    expect(res.status).toBe(401);
  });

  it('should filter requests by quota increase', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const res = await searchPrivateCloudRequestsApi({
      quotaIncrease: true,
      pageSize: 100,
    });

    expect(res.status).toBe(200);

    const result = await res.json();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should reject a regular user session', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res = await searchPrivateCloudRequestsApi({}, false);

    expect(res.status).toBe(401);
  });
});
