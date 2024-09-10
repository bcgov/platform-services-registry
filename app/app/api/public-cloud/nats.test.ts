import { expect } from '@jest/globals';
import _kebabCase from 'lodash-es/kebabCase';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import {
  createPublicCloudProduct,
  updatePublicCloudProduct,
  deletePublicCloudProduct,
} from '@/services/api-test/public-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

describe('Public Cloud NATs', () => {
  it('should send NATs message when creating a new product', async () => {
    // @ts-ignore
    sendNatsMessage.mockClear();
    const decisionData = await createPublicCloudProduct();

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
    // @ts-ignore
    sendNatsMessage.mockClear();

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
    // @ts-ignore
    sendNatsMessage.mockClear();

    const decisionData = await deletePublicCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);

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
