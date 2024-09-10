import { expect } from '@jest/globals';
import _kebabCase from 'lodash-es/kebabCase';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProduct,
  deletePrivateCloudProduct,
} from '@/services/api-test/private-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';
import {
  DefaultCpuOptions,
  DefaultCpuOptionsKey,
  DefaultMemoryOptions,
  DefaultMemoryOptionsKey,
  DefaultStorageOptions,
  DefaultStorageOptionsKey,
} from '@/services/nats/private-cloud/constants';

describe('Private Cloud NATs', () => {
  it('should send NATs message when creating a new product', async () => {
    // @ts-ignore
    sendNatsMessage.mockClear();

    const decisionData = await createPrivateCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledWith(
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'create',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: expect.arrayContaining([
          expect.objectContaining({ email: decisionData.projectOwner.email }),
          expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.developmentQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.developmentQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.developmentQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.testQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.testQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.testQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.productionQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.productionQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.productionQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.toolsQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.toolsQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.toolsQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when updating a product', async () => {
    // @ts-ignore
    sendNatsMessage.mockClear();

    const decisionData = await updatePrivateCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
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
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.developmentQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.developmentQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.developmentQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.testQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.testQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.testQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.productionQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.productionQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.productionQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.toolsQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.toolsQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.toolsQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when deleting a product', async () => {
    // @ts-ignore
    sendNatsMessage.mockClear();

    const decisionData = await deletePrivateCloudProduct();

    expect(sendNatsMessage).toHaveBeenCalled();
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
          expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email }),
        ]),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: expect.arrayContaining([
          expect.objectContaining({
            name: `${decisionData.licencePlate}-dev`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.developmentQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.developmentQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.developmentQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-test`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.testQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.testQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.testQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-prod`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.productionQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.productionQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.productionQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
          expect.objectContaining({
            name: `${decisionData.licencePlate}-tools`,
            quota: expect.objectContaining({
              cpu: DefaultCpuOptions[decisionData.toolsQuota.cpu as DefaultCpuOptionsKey].name,
              memory: DefaultMemoryOptions[decisionData.toolsQuota.memory as DefaultMemoryOptionsKey].name,
              storage: DefaultStorageOptions[decisionData.toolsQuota.storage as DefaultStorageOptionsKey].name,
            }),
          }),
        ]),
        profile_id: expect.any(String),
      }),
    );
  });
});
