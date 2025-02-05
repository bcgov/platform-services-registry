import { expect } from '@jest/globals';
import _kebabCase from 'lodash-es/kebabCase';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import prisma from '@/core/prisma';
import { mockNoRoleUsers, upsertMockUser } from '@/helpers/mock-users';
import {
  createPublicCloudProduct,
  updatePublicCloudProduct,
  deletePublicCloudProduct,
} from '@/services/api-test/public-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

const [PO, TL1, TL2, EA] = mockNoRoleUsers;

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA] = await Promise.all([
    prisma.user.findUnique({ where: { email: PO.email } }),
    prisma.user.findUnique({ where: { email: TL1.email } }),
    prisma.user.findUnique({ where: { email: TL2.email } }),
    prisma.user.findUnique({ where: { email: EA.email } }),
  ]);

  memberData.projectOwner.id = createdPO!.id;
  memberData.primaryTechnicalLead.id = createdTL1!.id;
  memberData.secondaryTechnicalLead.id = createdTL2!.id;
  memberData.expenseAuthority.id = createdEA!.id;
});

describe('Public Cloud NATs', () => {
  beforeEach(() => {
    // @ts-ignore
    sendNatsMessage.mockClear();
  });

  it('should send NATs message when creating a new product', async () => {
    const decisionData = await createPublicCloudProduct();

    console.log('Decision Data: ', decisionData);

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(1);
    expect(sendNatsMessage).toHaveBeenCalledWith(
      PUBLIC_NATS_URL,
      `registry_project_provisioning_${decisionData.provider.toLowerCase()}`,
      {
        project_set_info: expect.objectContaining({
          request_type: 'CREATE',
          project_name: decisionData.name,
          licence_plate: decisionData.licencePlate,
          ministry_name: decisionData.ministry,
          account_coding: decisionData.billing.accountCoding,
          budgets: decisionData.budget,
          requested_environments: {
            dev: decisionData.environmentsEnabled.development,
            prod: decisionData.environmentsEnabled.production,
            test: decisionData.environmentsEnabled.test,
            tools: decisionData.environmentsEnabled.tools,
          },
          requested_product_owner: expect.objectContaining({ email: decisionData.projectOwner.email }),
          requested_tech_leads: [
            expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
            expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
          ],
          requested_expense_authority: expect.objectContaining({ email: decisionData.expenseAuthority.email }),
        }),
      },
    );
  });

  it('should send NATs message when updating a product', async () => {
    const decisionData = await updatePublicCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PUBLIC_NATS_URL,
      `registry_project_provisioning_${decisionData.provider.toLowerCase()}`,
      {
        project_set_info: expect.objectContaining({
          request_type: 'EDIT',
          project_name: decisionData.name,
          licence_plate: decisionData.licencePlate,
          ministry_name: decisionData.ministry,
          account_coding: decisionData.billing.accountCoding,
          budgets: decisionData.budget,
          requested_environments: {
            dev: decisionData.environmentsEnabled.development,
            prod: decisionData.environmentsEnabled.production,
            test: decisionData.environmentsEnabled.test,
            tools: decisionData.environmentsEnabled.tools,
          },
          requested_product_owner: expect.objectContaining({ email: decisionData.projectOwner.email }),
          requested_tech_leads: [
            expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
            expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
          ],
          requested_expense_authority: expect.objectContaining({ email: decisionData.expenseAuthority.email }),
        }),
      },
    );
  });

  it('should send NATs message when deleting a product', async () => {
    const decisionData = await deletePublicCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PUBLIC_NATS_URL,
      `registry_project_provisioning_${decisionData.provider.toLowerCase()}`,
      {
        project_set_info: expect.objectContaining({
          request_type: 'DELETE',
          project_name: decisionData.name,
          licence_plate: decisionData.licencePlate,
          ministry_name: decisionData.ministry,
          account_coding: decisionData.billing.accountCoding,
          budgets: decisionData.budget,
          requested_environments: {
            dev: decisionData.environmentsEnabled.development,
            prod: decisionData.environmentsEnabled.production,
            test: decisionData.environmentsEnabled.test,
            tools: decisionData.environmentsEnabled.tools,
          },
          requested_product_owner: expect.objectContaining({ email: decisionData.projectOwner.email }),
          requested_tech_leads: [
            expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
            expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
          ],
          requested_expense_authority: expect.objectContaining({ email: decisionData.expenseAuthority.email }),
        }),
      },
    );
  });
});
