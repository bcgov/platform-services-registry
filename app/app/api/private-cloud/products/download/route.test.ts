import { expect } from '@jest/globals';
import { parse } from 'csv-parse/sync';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { formatFullName } from '@/helpers/user';
import { DB_DATA } from '@/jest.mock';
import { DecisionStatus, Cluster, ProjectStatus, RequestType } from '@/prisma/client';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct, downloadPrivateCloudProducts } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';
import { PrivateProductCsvRecord } from '@/types/csv';
import { PrivateCloudRequestSimple } from '@/types/private-cloud';
import { formatDateSimple } from '@/utils/js';

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

const requests = {
  one: {} as unknown as PrivateCloudRequestSimple,
  two: {} as unknown as PrivateCloudRequestSimple,
};

// TODO: add tests for ministry roles
describe('Download Private Cloud Products - Permissions', () => {
  it('should successfully delete all private cloud products', async () => {
    await prisma.privateCloudProduct.deleteMany();
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const productData = createSamplePrivateCloudProductData({ data: { ...memberData } });
    const res1 = await createPrivateCloudProduct(productData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);
    requests.one = await res2.json();

    await mockTeamServiceAccount(['private-admin']);
    const res3 = await provisionPrivateCloudProduct(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully download 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);

    const record1 = records[0];
    const project = await prisma.privateCloudProduct.findUnique({
      where: { licencePlate: requests.one.licencePlate },
      include: { projectOwner: true, primaryTechnicalLead: true, secondaryTechnicalLead: true },
    });

    expect(record1.Name).toBe(project?.name);
    expect(record1.Description).toBe(project?.description);
    expect(record1.Cluster).toBe(project?.cluster);
    expect(record1['Project Owner email']).toBe(project?.projectOwner.email);
    expect(record1['Project Owner name']).toBe(formatFullName(project?.projectOwner));
    expect(record1['Primary Technical Lead email']).toBe(project?.primaryTechnicalLead.email);
    expect(record1['Primary Technical Lead name']).toBe(formatFullName(project?.primaryTechnicalLead));
    expect(record1['Secondary Technical Lead email']).toBe(project?.secondaryTechnicalLead?.email);
    expect(record1['Secondary Technical Lead name']).toBe(formatFullName(project?.secondaryTechnicalLead));
    expect(record1['Create date']).toBe(formatDateSimple(project?.createdAt ?? ''));
    expect(record1['Update date']).toBe(formatDateSimple(project?.updatedAt ?? ''));
    expect(record1['Licence plate']).toBe(project?.licencePlate);
    expect(record1.Status).toBe(project?.status);
  });

  it('should successfully download 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const productData = createSamplePrivateCloudProductData({ data: { ...randomMemberData } });
    const res1 = await createPrivateCloudProduct(productData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);
    requests.two = await res2.json();

    await mockTeamServiceAccount(['private-admin']);
    const res3 = await provisionPrivateCloudProduct(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully download 1 project by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 2 projects by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(2);
  });
});

describe('Download Private Cloud Products - Validations', () => {
  it('should successfully delete all private cloud products', async () => {
    await prisma.privateCloudProduct.deleteMany();
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const aestOrg = DB_DATA.organizations.find((org) => org.code === 'AEST');
    const citzOrg = DB_DATA.organizations.find((org) => org.code === 'CITZ');

    const datasets: any[] = [];
    datasets.push(
      createSamplePrivateCloudProductData({ data: { organizationId: aestOrg?.id, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: aestOrg?.id, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: aestOrg?.id, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: aestOrg?.id, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: aestOrg?.id, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: citzOrg?.id, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: citzOrg?.id, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: citzOrg?.id, cluster: Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { organizationId: citzOrg?.id, cluster: Cluster.CLAB } }),
      createSamplePrivateCloudProductData({
        data: { organizationId: citzOrg?.id, cluster: Cluster.KLAB, name: '______name______' },
      }),
    );

    await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPrivateCloudProduct(data);
        const dat1 = await res1.json();

        await mockSessionByRole(GlobalRole.PrivateReviewer);
        await makePrivateCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          decision: DecisionStatus.APPROVED,
        });

        await mockTeamServiceAccount(['private-admin']);
        await provisionPrivateCloudProduct(dat1.licencePlate);
      }),
    );
  });

  it('should successfully download 10 projects by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(10);
  });

  it('should successfully download 5 projects by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({
      ministries: ['AEST'],
      clusters: [Cluster.CLAB],
      status: [ProjectStatus.ACTIVE],
    });

    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(3);
  });

  it('should successfully download 1 project by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PrivateProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 0 project by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({
      search: '______nonexistent______',
    });

    expect(res1.status).toBe(204);
  });

  it('should fail to download projects by admin due to an invalid cluster', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPrivateCloudProducts({
      clusters: ['INVALID' as Cluster],
    });

    expect(res1.status).toBe(400);
  });
});
