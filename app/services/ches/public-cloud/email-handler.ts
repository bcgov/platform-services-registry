import { RequestType } from '@prisma/client';
import { render } from '@react-email/render';
import { AUTH_RESOURCE } from '@/config';
import { logger } from '@/core/logging';
import AdminCreateRequestTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import BillingReviewerMou from '@/emails/_templates/public-cloud/BillingReviewerMou';
import EmouServiceAgreementTemplate from '@/emails/_templates/public-cloud/EmouServiceAgreement';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import ExpenseAuthorityMou from '@/emails/_templates/public-cloud/ExpenseAuthorityMou';
import TeamCreateRequestTemplate from '@/emails/_templates/public-cloud/TeamCreateRequest';
import TeamCreateRequestApprovalTemplate from '@/emails/_templates/public-cloud/TeamCreateRequestApproval';
import TeamCreateRequestCompletionTemplate from '@/emails/_templates/public-cloud/TeamCreateRequestCompletion';
import TeamCreateRequestRejectionTemplate from '@/emails/_templates/public-cloud/TeamCreateRequestRejection';
import TeamDeleteRequestTemplate from '@/emails/_templates/public-cloud/TeamDeleteRequest';
import TeamDeleteRequestApprovalTemplate from '@/emails/_templates/public-cloud/TeamDeleteRequestApproval';
import TeamDeleteRequestCompletionTemplate from '@/emails/_templates/public-cloud/TeamDeleteRequestCompletion';
import TeamDeleteRequestRejectionTemplate from '@/emails/_templates/public-cloud/TeamDeleteRequestRejection';
import TeamEditRequestTemplate from '@/emails/_templates/public-cloud/TeamEditRequest';
import TeamEditRequestCompletionTemplate from '@/emails/_templates/public-cloud/TeamEditRequestCompletion';
import { getEmouFileName } from '@/helpers/emou';
import { generateEmouPdf, Billing } from '@/helpers/pdfs/emou';
import { adminPublicEmails } from '@/services/ches/constant';
import { sendEmail } from '@/services/ches/core';
import { findUsersByClientRole } from '@/services/keycloak/app-realm';
import { PublicCloudProductDetail, PublicCloudRequestDetail } from '@/types/public-cloud';

export async function sendEmouServiceAgreementEmail(request: PublicCloudRequestDetail) {
  const eaContent = render(EmouServiceAgreementTemplate({ request }), { pretty: false });
  const emouPdfBuff = await generateEmouPdf(request.decisionData, request.decisionData.billing);
  const billingReviewers = await findUsersByClientRole(AUTH_RESOURCE, 'billing-reviewer');

  return sendEmail({
    subject: 'eMOU Service Agreement',
    to: [...billingReviewers.map((v) => v.email ?? ''), request.decisionData.expenseAuthority?.email],
    body: eaContent,
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

export const sendCreateRequestEmails = async (request: PublicCloudRequestDetail, requester: string) => {
  try {
    const teamEmail = render(TeamCreateRequestTemplate({ request, requester }), { pretty: false });

    const team = sendEmail({
      subject: `Provisioning request for ${request.decisionData.name} received`,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      body: teamEmail,
    });

    let ea = null;

    if (request.decisionData?.billing && request.decisionData.billing.approved) {
      ea = sendEmouServiceAgreementEmail(request);
    } else {
      const eaContent = render(ExpenseAuthorityMou({ request }), { pretty: false });
      ea = sendEmail({
        body: eaContent,
        to: [request.decisionData.expenseAuthority?.email],
        subject: 'Expense Authority eMOU request',
      });
    }

    await Promise.all([team, ea]);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
};

export const sendAdminCreateRequestEmails = async (request: PublicCloudRequestDetail, requester: string) => {
  try {
    const adminEmail = render(AdminCreateRequestTemplate({ request, requester }), { pretty: false });

    const admins = sendEmail({
      body: adminEmail,
      to: adminPublicEmails,
      subject: `New Provisioning request for ${request.decisionData.name} in Registry waiting for your approval`,
    });

    await Promise.all([admins, sendEmouServiceAgreementEmail(request)]);
  } catch (error) {
    logger.error('sendRequestReviewEmails:', error);
  }
};

export const sendEditRequestEmails = async (request: PublicCloudRequestDetail, requester: string) => {
  try {
    const teamContent = render(TeamEditRequestTemplate({ request, requester }), { pretty: false });

    await sendEmail({
      subject: `Edit summary for ${request.decisionData.name}`,
      body: teamContent,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
        request.originalData?.projectOwner.email,
        request.originalData?.primaryTechnicalLead.email,
        request.originalData?.secondaryTechnicalLead?.email,
      ],
    });
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (request: PublicCloudRequestDetail, requester: string) => {
  const decisionData = request.decisionData;

  try {
    const teamContent = render(TeamDeleteRequestTemplate({ request, requester }), { pretty: false });
    const adminContent = render(AdminDeleteRequestTemplate({ request, requester }), { pretty: false });

    const team = sendEmail({
      subject: `Request to delete ${decisionData.name} product received`,
      to: [
        decisionData.projectOwner.email,
        decisionData.primaryTechnicalLead.email,
        decisionData.secondaryTechnicalLead?.email,
      ],
      body: teamContent,
    });

    const admin = sendEmail({
      subject: `${request.decisionData.name} is marked for deletion`,
      to: adminPublicEmails,
      body: adminContent,
    });

    await Promise.all([team, admin]);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
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

export const sendPublicCloudBillingReviewEmails = async (request: PublicCloudRequestDetail, emails: string[]) => {
  try {
    const body = render(BillingReviewerMou({ request }), { pretty: false });

    const emailProm = sendEmail({
      body,
      to: emails,
      subject: `eMOU review request`,
    });

    await Promise.all([emailProm]);
  } catch (error) {
    logger.error('sendPublicCloudBillingReviewEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PublicCloudRequestDetail) => {
  try {
    let subject = '';
    let content = '';
    if (request.type == RequestType.CREATE) {
      content = render(TeamCreateRequestApprovalTemplate({ request }), { pretty: false });
      subject = 'Product has been provisioned';
    } else if (request.type == RequestType.DELETE) {
      content = render(TeamDeleteRequestApprovalTemplate({ request }), { pretty: false });
      subject = 'Product delete request has been completed';
    }

    if (!content) return;

    const team = sendEmail({
      subject,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      body: content,
    });

    const proms = [team];

    if (request.originalData?.expenseAuthorityId !== request.decisionData.expenseAuthorityId) {
      proms.push(sendExpenseAuthorityEmail(request));
    }

    await Promise.all(proms);
  } catch (error) {
    logger.error('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (request: PublicCloudRequestDetail) => {
  try {
    let subject = '';
    let content = '';
    if (request.type == RequestType.CREATE) {
      content = render(TeamCreateRequestRejectionTemplate({ request }), { pretty: false });
      subject = 'New product request has been rejected';
    } else if (request.type == RequestType.DELETE) {
      content = render(TeamDeleteRequestRejectionTemplate({ request }), { pretty: false });
      subject = 'Product delete request has been rejected';
    }

    if (!content) return;

    await sendEmail({
      subject,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      body: content,
    });
  } catch (error) {
    logger.error('sendRequestRejectionEmails:', error);
  }
};

export const sendRequestCompletionEmails = async (request: PublicCloudRequestDetail) => {
  try {
    let subject = '';
    let content = '';

    if (request.type == RequestType.CREATE) {
      subject = 'Product has been provisioned';
      content = render(TeamCreateRequestCompletionTemplate({ request }), { pretty: false });
    } else if (request.type == RequestType.EDIT) {
      subject = 'Product edit request has been completed';
      content = render(TeamEditRequestCompletionTemplate({ request }), { pretty: false });
    } else if (request.type == RequestType.DELETE) {
      subject = 'Product delete request has been completed';
      content = render(TeamDeleteRequestCompletionTemplate({ request }), { pretty: false });
    }

    if (!content) return;

    const { decisionData } = request;

    await sendEmail({
      subject,
      to: [
        decisionData.projectOwner.email,
        decisionData.primaryTechnicalLead.email,
        decisionData.secondaryTechnicalLead?.email,
      ],
      body: content,
    });
  } catch (error) {
    logger.error('sendRequestCompletionEmails:', error);
  }
};
