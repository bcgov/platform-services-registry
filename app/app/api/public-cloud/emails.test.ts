import { expect } from '@jest/globals';
import _castArray from 'lodash-es/castArray';
import _kebabCase from 'lodash-es/kebabCase';
import { GlobalRole } from '@/constants';
import {
  createPublicCloudProduct,
  updatePublicCloudProduct,
  deletePublicCloudProduct,
} from '@/services/api-test/public-cloud/helpers';
import { sendEmail } from '@/services/ches/core';
import { findUserEmailsByAuthRole } from '@/services/keycloak/app-realm';
import { compareEmailText } from '@/utils/js/jest';

expect.extend({
  compareEmailText,
});

describe('Public Cloud Emails', () => {
  beforeEach(() => {
    // @ts-ignore
    sendEmail.mockClear();
  });

  it('should send Email when creating a new product', async () => {
    const decisionData = await createPublicCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PublicReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request received',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `You have requested a new project set for ${decisionData.name} on the Public Cloud Landing Zone - ${decisionData.provider}. Our administrators have been notified and will review your request.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: `You have been added as the Expense Authority for ${decisionData.name}`,
        to: expect.arrayContaining([decisionData.expenseAuthority.email]),
        body: expect.compareEmailText(
          `You are now the Expense Authority for the the product ${decisionData.name} on the Public Cloud.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'Your provisioning request has been approved',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `We are pleased to inform you that your request to create the product ${decisionData.name} has been approved on the Public Cloud Landing Zone ${decisionData.provider}.`,
        ),
      }),
    );
  });

  it('should send Email message when updating a product', async () => {
    const decisionData = await updatePublicCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PublicReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(4);
    // CREATE
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request received',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `You have requested a new project set for ${decisionData.name} on the Public Cloud Landing Zone - ${decisionData.provider}. Our administrators have been notified and will review your request.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: `You have been added as the Expense Authority for ${decisionData.name}`,
        to: expect.arrayContaining([decisionData.expenseAuthority.email]),
        body: expect.compareEmailText(
          `You are now the Expense Authority for the the product ${decisionData.name} on the Public Cloud.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'Your provisioning request has been approved',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `We are pleased to inform you that your request to create the product ${decisionData.name} has been approved on the Public Cloud Landing Zone ${decisionData.provider}.`,
        ),
      }),
    );
    // EDIT
    expect(sendEmail).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        subject: 'New edit request received',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `You have edited your product ${decisionData.name} in the Public Cloud Landing Zone with the licence plate ${decisionData.licencePlate}.  You can see a summary of the changes below in this email, or click the button to view them in the Product Registry.`,
        ),
      }),
    );
  });

  it('should send Email message when deleting a product', async () => {
    const decisionData = await deletePublicCloudProduct();
    expect(decisionData).not.toBeNull();
    if (!decisionData) return;

    const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PublicReviewer);

    expect(sendEmail).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(6);

    // CREATE
    expect(sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        subject: 'New provisioning request received',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `You have requested a new project set for ${decisionData.name} on the Public Cloud Landing Zone - ${decisionData.provider}. Our administrators have been notified and will review your request.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        subject: `You have been added as the Expense Authority for ${decisionData.name}`,
        to: expect.arrayContaining([decisionData.expenseAuthority.email]),
        body: expect.compareEmailText(
          `You are now the Expense Authority for the the product ${decisionData.name} on the Public Cloud.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        subject: 'Your provisioning request has been approved',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `We are pleased to inform you that your request to create the product ${decisionData.name} has been approved on the Public Cloud Landing Zone ${decisionData.provider}.`,
        ),
      }),
    );
    // DELETE
    expect(sendEmail).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        subject: 'New delete request awaiting review',
        to: expect.arrayContaining(reviewerEmails),
        body: expect.compareEmailText(
          `There is a new delete request for ${decisionData.name} that requires your attention. Log in to the Registry to review the details. If you have any questions about the request, the PO and TL contact details are included below and in the Registry.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        subject: 'New delete request received',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(
          `We have received your deletion request for ${decisionData.name}. You will receive an email once your request has been processed and completed.`,
        ),
      }),
    );
    expect(sendEmail).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        subject: 'Your delete request has been approved',
        to: expect.arrayContaining([
          decisionData.projectOwner.email,
          decisionData.primaryTechnicalLead.email,
          decisionData.secondaryTechnicalLead?.email,
        ]),
        body: expect.compareEmailText(`Your deletion request has been sent to our platform administrators!`),
      }),
    );
  });
});
