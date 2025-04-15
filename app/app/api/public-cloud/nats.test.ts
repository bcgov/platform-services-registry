import { expect } from '@jest/globals';
import { PUBLIC_NATS_URL } from '@/config';
import {
  createPublicCloudProduct,
  updatePublicCloudProduct,
  deletePublicCloudProduct,
} from '@/services/api-test/public-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

describe('Public Cloud NATs', () => {
  beforeEach(() => {
    // @ts-ignore
    sendNatsMessage.mockClear();
  });

  it('should send NATs message when creating a new product', async () => {
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
