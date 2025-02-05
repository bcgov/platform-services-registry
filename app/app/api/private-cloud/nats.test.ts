import { expect } from '@jest/globals';
import _kebabCase from 'lodash-es/kebabCase';
import { PRIVATE_NATS_URL } from '@/config';
import prisma from '@/core/prisma';
import { mockNoRoleUsers, upsertMockUser } from '@/helpers/mock-users';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProduct,
  deletePrivateCloudProduct,
} from '@/services/api-test/private-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

const [PO, TL1, TL2] = mockNoRoleUsers;

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2] = await Promise.all([
    prisma.user.findUnique({ where: { email: PO.email } }),
    prisma.user.findUnique({ where: { email: TL1.email } }),
    prisma.user.findUnique({ where: { email: TL2.email } }),
  ]);

  memberData.projectOwner.id = createdPO!.id;
  memberData.primaryTechnicalLead.id = createdTL1!.id;
  memberData.secondaryTechnicalLead.id = createdTL2!.id;
});

describe('Private Cloud NATs', () => {
  beforeEach(() => {
    // @ts-ignore
    sendNatsMessage.mockClear();
  });

  it('should send NATs message when creating a new product', async () => {
    const decisionData = await createPrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(1);
    expect(sendNatsMessage).toHaveBeenCalledWith(
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'create',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: expect.arrayContaining([
          expect.objectContaining({ email: decisionData.projectOwner.email }),
          expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead?.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when updating a product', async () => {
    const decisionData = await updatePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'edit',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: expect.arrayContaining([
          expect.objectContaining({ email: decisionData.projectOwner.email }),
          expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead?.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when deleting a product', async () => {
    const decisionData = await deletePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'delete',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: expect.arrayContaining([
          expect.objectContaining({ email: decisionData.projectOwner.email }),
          expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead?.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });
});
