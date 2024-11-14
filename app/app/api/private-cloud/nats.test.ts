import { expect } from '@jest/globals';
import _kebabCase from 'lodash-es/kebabCase';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import { cpuMetadata, memoryMetadata, storageMetadata } from '@/constants';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProduct,
  deletePrivateCloudProduct,
} from '@/services/api-test/private-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

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
