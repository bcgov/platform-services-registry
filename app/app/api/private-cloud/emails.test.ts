import { expect } from '@jest/globals';
import _castArray from 'lodash-es/castArray';
import _kebabCase from 'lodash-es/kebabCase';
import { GlobalRole } from '@/constants';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProduct,
  deletePrivateCloudProduct,
} from '@/services/api-test/private-cloud/helpers';
import { sendEmail } from '@/services/ches/core';
import { findUserEmailsByAuthRole } from '@/services/keycloak/app-realm';
import { compareEmailText } from '@/utils/js/jest';

expect.extend({
  compareEmailText,
});

describe('Private Cloud Emails', () => {
  beforeEach(() => {
    // @ts-ignore
    sendEmail.mockClear();
  });

  it('should send Email when creating a new product', async () => {
    const decisionData = await createPrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new request that requires your review. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: 'Your provisioning request has been completed',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText('success! your provisioning request is complete!'),
      }),
    );
  });

  it('should send Email message when updating a product', async () => {
    const decisionData = await updatePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(4);
    // CREATE
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new request that requires your review. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: 'Your provisioning request has been completed',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText('success! your provisioning request is complete!'),
      }),
    );
    // EDIT
    expect(sendEmail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'New edit request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new request that requires your review. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        subject: 'Your edit request has been completed',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `The project set edit request for ${decisionData.name} has been successfully completed. You can now log in to OpenShift cluster console [https://console.apps.silver.devops.gov.bc.ca/] and you will see your new resource quota values.`,
        ),
      }),
    );
  });

  it('should send Email message when deleting a product', async () => {
    const decisionData = await deletePrivateCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(4);
    // CREATE
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new request that requires your review. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: 'Your provisioning request has been completed',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText('success! your provisioning request is complete!'),
      }),
    );
    // DELETE
    expect(sendEmail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'New delete request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new delete request that requires your review. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL(s) contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        subject: 'Your delete request has been completed',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `The project set deletion for ${decisionData.name} has been successfully completed.`,
        ),
      }),
    );
  });
});
