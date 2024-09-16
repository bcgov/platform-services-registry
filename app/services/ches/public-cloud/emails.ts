import { AUTH_RESOURCE } from '@/config';
import AdminCreateRequestTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import BillingReviewerMouTemplate from '@/emails/_templates/public-cloud/BillingReviewerMou';
import EmouServiceAgreementTemplate from '@/emails/_templates/public-cloud/EmouServiceAgreement';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import ExpenseAuthorityMouTemplate from '@/emails/_templates/public-cloud/ExpenseAuthorityMou';
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
import { generateEmouPdf } from '@/helpers/pdfs/emou';
import { adminPublicEmails } from '@/services/ches/constant';
import { sendEmail, getContent } from '@/services/ches/core';
import { findUsersByClientRole } from '@/services/keycloak/app-realm';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

function getTeamEmails(request: PublicCloudRequestDetail) {
  return [
    request.decisionData.projectOwner.email,
    request.decisionData.primaryTechnicalLead.email,
    request.decisionData.secondaryTechnicalLead?.email,
    request.originalData?.projectOwner.email,
    request.originalData?.primaryTechnicalLead.email,
    request.originalData?.secondaryTechnicalLead?.email,
  ];
}

export function sendAdminCreateRequest(request: PublicCloudRequestDetail, requester: string) {
  const content = getContent(AdminCreateRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New provisioning request awaiting review',
    to: adminPublicEmails,
    body: content,
  });
}

export function sendAdminDeleteRequest(request: PublicCloudRequestDetail, requester: string) {
  const content = getContent(AdminDeleteRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New delete request awaiting review',
    to: adminPublicEmails,
    body: content,
  });
}

export function sendTeamCreateRequest(request: PublicCloudRequestDetail, requester: string) {
  const content = getContent(TeamCreateRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New provisioning request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestApproval(request: PublicCloudRequestDetail) {
  const content = getContent(TeamCreateRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been approved',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestCompletion(request: PublicCloudRequestDetail) {
  const content = getContent(TeamCreateRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestRejection(request: PublicCloudRequestDetail) {
  const content = getContent(TeamCreateRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been rejected',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequest(request: PublicCloudRequestDetail, requester: string) {
  const content = getContent(TeamDeleteRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New delete request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestApproval(request: PublicCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been approved',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestCompletion(request: PublicCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestRejection(request: PublicCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been rejected',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequest(request: PublicCloudRequestDetail, requester: string) {
  const content = getContent(TeamEditRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New edit request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequestCompletion(request: PublicCloudRequestDetail) {
  const content = getContent(TeamEditRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export async function sendBillingReviewerMou(request: PublicCloudRequestDetail) {
  const content = getContent(BillingReviewerMouTemplate({ request }));
  const billingReviewers = await findUsersByClientRole(AUTH_RESOURCE, 'billing-reviewer');

  return sendEmail({
    subject: 'eMOU review request',
    to: [...billingReviewers.map((v) => v.email ?? '')],
    body: content,
  });
}

export async function sendEmouServiceAgreement(request: PublicCloudRequestDetail) {
  const content = getContent(EmouServiceAgreementTemplate({ request }));
  const emouPdfBuff = await generateEmouPdf(request.decisionData, request.decisionData.billing);
  const billingReviewers = await findUsersByClientRole(AUTH_RESOURCE, 'billing-reviewer');

  return sendEmail({
    subject: 'eMOU Service Agreement',
    to: [...billingReviewers.map((v) => v.email ?? ''), request.decisionData.expenseAuthority?.email],
    body: content,
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

export function sendExpenseAuthority(request: PublicCloudRequestDetail) {
  const content = getContent(ExpenseAuthorityTemplate({ request }));

  return sendEmail({
    subject: `You have been added as the Expense Authority for ${request.decisionData.name}`,
    to: [request.decisionData.expenseAuthority?.email],
    body: content,
  });
}

export function sendExpenseAuthorityMou(request: PublicCloudRequestDetail) {
  const content = getContent(ExpenseAuthorityMouTemplate({ request }));

  return sendEmail({
    subject: 'Expense Authority eMOU request',
    to: [request.decisionData.expenseAuthority?.email],
    body: content,
  });
}
