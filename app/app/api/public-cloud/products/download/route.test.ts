import { expect } from '@jest/globals';
import { DecisionStatus, Ministry, Provider, TaskType, TaskStatus, ProjectStatus, RequestType } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers, upsertMockUser } from '@/helpers/mock-users';
import { ministryKeyToName, getTotalQuotaStr } from '@/helpers/product';
import { formatFullName } from '@/helpers/user';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  downloadPublicCloudProjects,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { PublicProductCsvRecord } from '@/types/csv';
import { formatDateSimple } from '@/utils/js';

const [PO, TL1, TL2, EA, RANDOM1, RANDOM2, RANDOM3, RANDOM4] = mockNoRoleUsers;

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

const randomMemberData = {
  projectOwner: RANDOM1,
  primaryTechnicalLead: RANDOM2,
  secondaryTechnicalLead: RANDOM3,
  expenseAuthority: RANDOM4,
};

const productData = {
  one: createSamplePublicCloudProductData({
    data: { ...memberData },
  }),
  two: createSamplePublicCloudProductData({
    data: { ...randomMemberData },
  }),
};

const requests = {
  one: null as any,
  two: null as any,
};

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA, RANDOM1, RANDOM2, RANDOM3, RANDOM4].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA, createdRANDOM1, createdRANDOM2, createdRANDOM3, createdRANDOM4] =
    await Promise.all([
      prisma.user.findUnique({ where: { email: PO.email } }),
      prisma.user.findUnique({ where: { email: TL1.email } }),
      prisma.user.findUnique({ where: { email: TL2.email } }),
      prisma.user.findUnique({ where: { email: EA.email } }),
      prisma.user.findUnique({ where: { email: RANDOM1.email } }),
      prisma.user.findUnique({ where: { email: RANDOM2.email } }),
      prisma.user.findUnique({ where: { email: RANDOM3.email } }),
      prisma.user.findUnique({ where: { email: RANDOM4.email } }),
    ]);

  productData.one.projectOwner.id = createdPO!.id;
  productData.one.primaryTechnicalLead.id = createdTL1!.id;
  productData.one.secondaryTechnicalLead.id = createdTL2!.id;
  productData.one.expenseAuthority.id = createdEA!.id;

  productData.two.projectOwner.id = createdRANDOM1!.id;
  productData.two.primaryTechnicalLead.id = createdRANDOM2!.id;
  productData.two.secondaryTechnicalLead.id = createdRANDOM3!.id;
  productData.two.expenseAuthority.id = createdRANDOM4!.id;
});

// TODO: add tests for ministry roles
describe('Download Public Cloud Products - Permissions', () => {
  it('should successfully delete all public cloud products', async () => {
    await prisma.publicCloudProject.deleteMany();
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);
    const res1 = await createPublicCloudProject(productData.one);
    if (res1.status !== 200) {
      console.log(JSON.stringify(await res1.json()), JSON.stringify(productData.one));
    }
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    const task1 = await prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            licencePlate: dat1.licencePlate,
          },
        },
      },
    });

    if (task1) {
      await mockSessionByEmail(dat1.decisionData.expenseAuthority.email);
      await signPublicCloudMou(dat1.licencePlate, {
        taskId: task1?.id ?? '',
        confirmed: true,
      });

      await mockSessionByRole(GlobalRole.BillingReviewer);
      const task2 = await prisma.task.findFirst({
        where: {
          type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
          status: TaskStatus.ASSIGNED,
          data: {
            equals: {
              licencePlate: dat1.licencePlate,
            },
          },
        },
      });

      await reviewPublicCloudMou(dat1.licencePlate, {
        taskId: task2?.id ?? '',
        decision: 'APPROVE',
      });
    }

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });

    expect(res2.status).toBe(200);
    requests.one = await res2.json();

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully download 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);

    const record1 = records[0];
    const project = await prisma.publicCloudProject.findUnique({
      where: { licencePlate: requests.one.licencePlate },
      include: { projectOwner: true, primaryTechnicalLead: true, secondaryTechnicalLead: true },
    });

    expect(record1.Name).toBe(project?.name);
    expect(record1.Description).toBe(project?.description);
    expect(record1.Ministry).toBe(ministryKeyToName(project?.ministry ?? ''));
    expect(record1.Provider).toBe(project?.provider);
    expect(record1['Reasons for selecting cloud provider']).toBe(project?.providerSelectionReasons?.join(', '));
    expect(record1['Description of selected reasons']).toBe(project?.providerSelectionReasonsNote);
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

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await createPublicCloudProject(productData.two);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);
    requests.two = await res2.json();

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully download 1 project by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 2 projects by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(2);
  });
});

describe('Download Public Cloud Products - Validations', () => {
  it('should successfully delete all public cloud products', async () => {
    await prisma.publicCloudProject.deleteMany();
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const datasets = [];
    datasets.push(
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({
        data: { ministry: Ministry.CITZ, provider: Provider.AZURE, name: '______name______' },
      }),
    );

    await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPublicCloudProject(data);
        const dat1 = await res1.json();

        await mockSessionByRole(GlobalRole.PublicReviewer);
        await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          accountCoding: dat1.decisionData.billing.accountCoding,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPublicCloudProject(dat1.licencePlate);
      }),
    );
  });

  it('should successfully download 10 projects by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({});
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(10);
  });

  it('should successfully download 5 projects by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({
      ministries: [Ministry.AEST],
      providers: [Provider.AWS],
      status: [ProjectStatus.ACTIVE],
    });

    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(3);
  });

  it('should successfully download 1 project by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toBe('text/csv');
    const csvContent = await res1.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as PublicProductCsvRecord[];

    expect(records.length).toBe(1);
  });

  it('should successfully download 0 project by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({
      search: '______nonexistent______',
    });

    expect(res1.status).toBe(204);
  });

  it('should fail to download projects by admin due to an invalid provider', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({
      providers: ['INVALID' as Provider],
    });

    expect(res1.status).toBe(400);
  });

  it('should fail to download projects by admin due to an invalid ministry', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await downloadPublicCloudProjects({
      ministries: ['INVALID' as Ministry],
    });

    expect(res1.status).toBe(400);
  });
});
