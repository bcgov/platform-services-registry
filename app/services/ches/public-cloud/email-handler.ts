import { render } from '@react-email/render';
import { AUTH_RESOURCE } from '@/config';
import { logger } from '@/core/logging';
import AdminCreateTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import BillingReviewerMou from '@/emails/_templates/public-cloud/BillingReviewerMou';
import CreateRequestTemplate from '@/emails/_templates/public-cloud/CreateRequest';
import DeleteApprovalTemplate from '@/emails/_templates/public-cloud/DeleteApproval';
import DeleteRequestTemplate from '@/emails/_templates/public-cloud/DeleteRequest';
import EditSummaryTemplate from '@/emails/_templates/public-cloud/EditSummary';
import EmouServiceAgreementTemplate from '@/emails/_templates/public-cloud/EmouServiceAgreement';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import ExpenseAuthorityMou from '@/emails/_templates/public-cloud/ExpenseAuthorityMou';
import ProvisionedTemplate from '@/emails/_templates/public-cloud/Provisioned';
import RequestApprovalTemplate from '@/emails/_templates/public-cloud/RequestApproval';
import RequestRejectionTemplate from '@/emails/_templates/public-cloud/RequestRejection';
import { getEmouFileName } from '@/helpers/emou';
import { generateEmouPdf, Billing } from '@/helpers/pdfs/emou';
import { adminPublicEmails } from '@/services/ches/email-constant';
import { sendEmail } from '@/services/ches/helpers';
import { findUsersByClientRole } from '@/services/keycloak/app-realm';
import { PublicCloudProductDetail, PublicCloudRequestDetail } from '@/types/public-cloud';

export async function sendEmouServiceAgreementEmail(request: PublicCloudRequestDetail) {
  const eaEmail = render(EmouServiceAgreementTemplate({ request }), { pretty: false });
  const emouPdfBuff = await generateEmouPdf(request.decisionData, request.decisionData.billing);
  const billingReviewers = await findUsersByClientRole(AUTH_RESOURCE, 'billing-reviewer');

  return sendEmail({
    body: eaEmail,
    to: [...billingReviewers.map((v) => v.email ?? ''), request.decisionData.expenseAuthority?.email],
    subject: 'eMOU Service Agreement',
    attachments: [
      {
        content: emouPdfBuff.toString('base64'),
        encoding: 'base64',
        filename: getEmouFileName(request.decisionData.name, request.decisionData.provider),
        contentType: 'application/pdf',
      },
    ],
  });
}

export const sendCreateRequestEmails = async (request: PublicCloudRequestDetail, userName: string) => {
  try {
    const userEmail = render(CreateRequestTemplate({ request, userName }), { pretty: false });

    const contacts = sendEmail({
      body: userEmail,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      subject: `Provisioning request for ${request.decisionData.name} received`,
    });

    let ea = null;

    if (request.decisionData?.billing && request.decisionData.billing.approved) {
      ea = sendEmouServiceAgreementEmail(request);
    } else {
      const eaEmail = render(ExpenseAuthorityMou({ request }), { pretty: false });
      ea = sendEmail({
        body: eaEmail,
        to: [request.decisionData.expenseAuthority?.email],
        subject: 'Expense Authority eMOU request',
      });
    }

    await Promise.all([contacts, ea]);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
};

export const sendPublicCloudBillingReviewEmails = async (request: PublicCloudRequestDetail, emails: string[]) => {
  try {
    const body = render(BillingReviewerMou({ request }), { pretty: false });

    const emailProm = sendEmail({
      bodyType: 'html',
      body,
      to: emails,
      subject: `eMOU review request`,
    });

    await Promise.all([emailProm]);
  } catch (error) {
    logger.error('sendPublicCloudBillingReviewEmails:', error);
  }
};

export const sendRequestReviewEmails = async (request: PublicCloudRequestDetail, userName: string) => {
  try {
    const adminEmail = render(AdminCreateTemplate({ request, userName }), { pretty: false });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminPublicEmails,
      subject: `New Provisioning request for ${request.decisionData.name} in Registry waiting for your approval`,
    });

    await Promise.all([admins]);
  } catch (error) {
    logger.error('sendRequestReviewEmails:', error);
  }
};

export const sendAdminDeleteRequestEmails = async (request: PublicCloudRequestDetail, userName: string) => {
  try {
    const adminEmail = render(AdminDeleteRequestTemplate({ request, userName }), { pretty: false });

    await sendEmail({
      body: adminEmail,
      to: adminPublicEmails,
      subject: `${request.decisionData.name} is marked for deletion`,
    });
  } catch (error) {
    logger.error('sendAdminDeleteRequestEmails:', error);
  }
};

export const sendEditRequestEmails = async (request: PublicCloudRequestDetail, userName: string) => {
  try {
    const userEmail = render(EditSummaryTemplate({ request, userName }), { pretty: false });

    await sendEmail({
      body: userEmail,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
        request.project?.projectOwner.email,
        request.project?.primaryTechnicalLead.email,
        request.project?.secondaryTechnicalLead?.email,
      ].filter(Boolean),
      subject: `Edit summary for ${request.decisionData.name}`,
    });
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PublicCloudRequestDetail) => {
  try {
    const email = render(RequestApprovalTemplate({ request }), { pretty: false });

    await sendEmail({
      body: email,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      subject: `Request for ${request.decisionData.name} has been approved`,
    });
  } catch (error) {
    logger.error('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (request: PublicCloudRequestDetail) => {
  const decisionData = request.decisionData;

  try {
    const email = render(RequestRejectionTemplate({ request }), {
      pretty: false,
    });
    await sendEmail({
      body: email,
      to: [
        decisionData.projectOwner.email,
        decisionData.primaryTechnicalLead.email,
        decisionData.secondaryTechnicalLead?.email,
      ],
      subject: `Request has been rejected for ${decisionData.name}`,
    });
  } catch (error) {
    logger.error('sendRequestRejectionEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (request: PublicCloudRequestDetail, userName: string) => {
  const decisionData = request.decisionData;

  try {
    const email = render(DeleteRequestTemplate({ request, userName }), { pretty: false });

    await sendEmail({
      body: email,
      to: [
        decisionData.projectOwner.email,
        decisionData.primaryTechnicalLead.email,
        decisionData.secondaryTechnicalLead?.email,
      ],
      subject: `Request to delete ${decisionData.name} product received`,
    });
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
};

export const sendDeleteRequestApprovalEmails = async (product: PublicCloudProductDetail) => {
  try {
    const email = render(DeleteApprovalTemplate({ product }), { pretty: false });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `Delete request for ${product.name} has been acknowledged`,
    });
  } catch (error) {
    logger.error('sendDeleteRequestApprovalEmails:', error);
  }
};

export const sendProvisionedEmails = async (product: PublicCloudProductDetail) => {
  try {
    const email = render(ProvisionedTemplate({ product }), { pretty: false });
    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `Product ${product.name} has been provisioned`,
    });
  } catch (error) {
    logger.error('sendProvisionedEmails:', error);
  }
};

export const sendExpenseAuthorityEmail = async (request: PublicCloudRequestDetail) => {
  try {
    const expenseAuthorityEmail = render(ExpenseAuthorityTemplate({ request }), { pretty: false });
    await sendEmail({
      body: expenseAuthorityEmail,
      to: [request.decisionData.expenseAuthority?.email].filter(Boolean),
      subject: `You have been added as the Expense Authority for ${request.decisionData.name}`,
    });
  } catch (error) {
    logger.error('sendExpenseAuthorityEmail:', error);
  }
};
