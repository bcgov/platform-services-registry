import { expect } from '@jest/globals';
import { DecisionStatus, Ministry, Cluster } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, searchPrivateCloudProjects } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const RANDOM1 = mockNoRoleUsers[3];
const RANDOM2 = mockNoRoleUsers[4];
const RANDOM3 = mockNoRoleUsers[5];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

const randomMemberData = {
  projectOwner: RANDOM1,
  primaryTechnicalLead: RANDOM2,
  secondaryTechnicalLead: RANDOM3,
};

// TODO: add tests for ministry roles
describe('Search Private Cloud Products - Permissions', () => {
  it('should successfully delete all private cloud products', async () => {
    await prisma.privateCloudProject.deleteMany();
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPrivateCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...randomMemberData },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPrivateCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 project by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 projects by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('Search Private Cloud Products - Validations', () => {
  it('should successfully delete all private cloud products', async () => {
    await prisma.privateCloudProject.deleteMany();
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole('admin');

    const datasets = [];
    datasets.push(
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB, name: '______name______' },
      }),
    );

    await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPrivateCloudProject(data);
        const dat1 = await res1.json();

        await makePrivateCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPrivateCloudProject(dat1.licencePlate);
      }),
    );
  });

  it('should successfully search 10 projects by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(10);
  });

  it('should successfully search 5 projects by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudProjects({
      ministry: Ministry.AEST,
      cluster: Cluster.CLAB,
      includeInactive: false,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(3);
  });

  it('should successfully search 1 project by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudProjects({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
