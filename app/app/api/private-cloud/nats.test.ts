import { expect } from '@jest/globals';
import { PRIVATE_NATS_URL } from '@/config';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProduct,
  deletePrivateCloudProduct,
} from '@/services/api-test/private-cloud/helpers';
import { sendNatsMessage } from '@/services/nats/core';

function getExpectedNamespaces(licencePlate: string) {
  return expect.arrayContaining(
    ['dev', 'test', 'prod', 'tools'].map((env) =>
      expect.objectContaining({
        name: `${licencePlate}-${env}`,
      }),
    ),
  );
}

function getExpectedContacts(decisionData: {
  projectOwner: { email: string };
  primaryTechnicalLead: { email: string };
  secondaryTechnicalLead: { email: string } | null;
  notificationEmails: string[];
}) {
  return expect.arrayContaining([
    expect.objectContaining({ email: decisionData.projectOwner.email }),
    expect.objectContaining({ email: decisionData.primaryTechnicalLead.email }),
    ...(decisionData.secondaryTechnicalLead
      ? [expect.objectContaining({ email: decisionData.secondaryTechnicalLead.email })]
      : []),
    ...decisionData.notificationEmails.map((email) =>
      expect.objectContaining({
        email,
        idir: '',
        upn: '',
        role: 'additional-contact',
      }),
    ),
  ]);
}

describe('Private Cloud NATs', () => {
  beforeEach(() => {
    // @ts-ignore
    sendNatsMessage.mockClear();
  });

  it('should send NATs message when creating a new product', async () => {
    const decisionData = await createPrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;
    expect(decisionData.notificationEmails).toHaveLength(2);
    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(1);
    expect(sendNatsMessage).toHaveBeenCalledWith(
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'create',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: getExpectedContacts(decisionData),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: getExpectedNamespaces(decisionData.licencePlate),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when updating a product', async () => {
    const decisionData = await updatePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;
    expect(decisionData.notificationEmails).toHaveLength(2);
    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'edit',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: getExpectedContacts(decisionData),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: getExpectedNamespaces(decisionData.licencePlate),
        profile_id: expect.any(String),
      }),
    );
  });

  it('should send NATs message when deleting a product', async () => {
    const decisionData = await deletePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;
    expect(decisionData.notificationEmails).toHaveLength(1);
    expect(sendNatsMessage).toHaveBeenCalled();
    expect(sendNatsMessage).toHaveBeenCalledTimes(2);
    expect(sendNatsMessage).toHaveBeenNthCalledWith(
      2,
      PRIVATE_NATS_URL,
      `registry_project_provisioning_${decisionData.cluster.toLowerCase()}`,
      expect.objectContaining({
        action: 'delete',
        cluster_name: decisionData.cluster.toLowerCase(),
        contacts: getExpectedContacts(decisionData),
        description: decisionData.description,
        licencePlate: decisionData.licencePlate,
        namespaces: getExpectedNamespaces(decisionData.licencePlate),
        profile_id: expect.any(String),
      }),
    );
  });
});
