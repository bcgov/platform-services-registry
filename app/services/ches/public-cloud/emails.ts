import { PublicCloudBilling, PublicCloudProductMemberRole } from '@prisma/client';
import { IS_PROD } from '@/config';
import { publicCloudTeamEmail, GlobalRole } from '@/constants';
import AdminCreateRequestTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import BillingReviewerMouTemplate from '@/emails/_templates/public-cloud/BillingReviewerMou';
import BillingReviewerMouProductTemplate from '@/emails/_templates/public-cloud/BillingReviewerMouProduct';
import EmouServiceAgreementTemplate from '@/emails/_templates/public-cloud/EmouServiceAgreement';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import ExpenseAuthorityMouTemplate from '@/emails/_templates/public-cloud/ExpenseAuthorityMou';
import ExpenseAuthorityMouProductTemplate from '@/emails/_templates/public-cloud/ExpenseAuthorityMouProduct';
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
import TeamRequestCancellationTemplate from '@/emails/_templates/public-cloud/TeamRequestCancellation';
import { getPublicCloudEmouFileName } from '@/helpers/emou';
import { generateEmouPdf } from '@/helpers/pdfs/emou';
import { safeSendEmail, sendEmail } from '@/services/ches/core';
import { getContent } from '@/services/ches/helpers';
import { findUserEmailsByAuthRole } from '@/services/keycloak/app-realm';
import {
  PublicCloudBillingDetailDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudRequestDetailDecorated,
} from '@/types/public-cloud';

async function getTeamEmails(request: PublicCloudRequestDetailDecorated) {
  const memberEmails = request.decisionData.members
    .filter((member) => member.roles.includes(PublicCloudProductMemberRole.SUBSCRIBER))
    .map((member) => member.email);

  return [
    request.decisionData.projectOwner.email,
    request.decisionData.primaryTechnicalLead.email,
    request.decisionData.secondaryTechnicalLead?.email,
    request.originalData?.projectOwner.email,
    request.originalData?.primaryTechnicalLead.email,
    request.originalData?.secondaryTechnicalLead?.email,
    ...memberEmails,
  ];
}

export async function sendAdminCreateRequest(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(AdminCreateRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PublicReviewer);

  return sendEmail({
    subject: 'New provisioning request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? publicCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminDeleteRequest(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(AdminDeleteRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PublicReviewer);

  return sendEmail({
    subject: 'New delete request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? publicCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendTeamCreateRequest(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(TeamCreateRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New provisioning request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestApproval(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamCreateRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been approved',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestCompletion(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamCreateRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestRejection(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamCreateRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been rejected',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamRequestCancellation(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(TeamRequestCancellationTemplate({ request, requester }));

  return sendEmail({
    subject: 'Your request has been cancelled',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequest(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(TeamDeleteRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New delete request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestApproval(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamDeleteRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been approved',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestCompletion(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamDeleteRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestRejection(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamDeleteRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been rejected',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequest(request: PublicCloudRequestDetailDecorated, requester: string) {
  const content = await getContent(TeamEditRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New edit request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequestCompletion(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(TeamEditRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendBillingReviewerMou(
  request: PublicCloudRequestDetailDecorated,
  billing: PublicCloudBillingDetailDecorated,
) {
  const content = await getContent(BillingReviewerMouTemplate({ request, billing }));
  const billingReviewerEmails = await findUserEmailsByAuthRole(GlobalRole.BillingReviewer);

  return safeSendEmail({
    subject: 'eMOU review request',
    to: billingReviewerEmails,
    body: content,
  });
}

export async function sendBillingReviewerMouProduct(
  product: PublicCloudProductDetailDecorated,
  billing: PublicCloudBillingDetailDecorated,
) {
  const content = await getContent(BillingReviewerMouProductTemplate({ product, billing }));
  const billingReviewerEmails = await findUserEmailsByAuthRole(GlobalRole.BillingReviewer);

  return safeSendEmail({
    subject: 'eMOU review request',
    to: billingReviewerEmails,
    body: content,
  });
}

export async function sendEmouServiceAgreement(
  request: PublicCloudRequestDetailDecorated,
  billing: PublicCloudBillingDetailDecorated,
) {
  const content = await getContent(EmouServiceAgreementTemplate({ request, billing }));
  const emouPdfBuff = await generateEmouPdf(request.decisionData, billing);
  const billingReviewerEmails = await findUserEmailsByAuthRole(GlobalRole.BillingReviewer);

  return sendEmail({
    subject: 'eMOU Service Agreement',
    to: [...billingReviewerEmails, request.decisionData.expenseAuthority?.email],
    cc: [IS_PROD ? publicCloudTeamEmail : ''],
    body: content,
    attachments: [
      {
        content: emouPdfBuff.toString('base64'),
        encoding: 'base64',
        filename: getPublicCloudEmouFileName(request.decisionData.name, request.decisionData.provider),
        contentType: 'application/pdf',
      },
    ],
  });
}

export async function sendExpenseAuthority(request: PublicCloudRequestDetailDecorated) {
  const content = await getContent(ExpenseAuthorityTemplate({ request }));

  return sendEmail({
    subject: `You have been added as the Expense Authority for ${request.decisionData.name}`,
    to: [request.decisionData.expenseAuthority?.email],
    body: content,
  });
}

export async function sendExpenseAuthorityMou(
  request: PublicCloudRequestDetailDecorated,
  billing: PublicCloudBillingDetailDecorated,
) {
  const content = await getContent(ExpenseAuthorityMouTemplate({ request, billing }));

  return safeSendEmail({
    subject: 'Expense Authority eMOU request',
    to: [request.decisionData.expenseAuthority?.email],
    body: content,
  });
}

export async function sendExpenseAuthorityMouProduct(
  product: PublicCloudProductDetailDecorated,
  billing: PublicCloudBillingDetailDecorated,
) {
  const content = await getContent(ExpenseAuthorityMouProductTemplate({ product, billing }));

  return safeSendEmail({
    subject: 'Expense Authority eMOU request',
    to: [product.expenseAuthority?.email],
    body: content,
  });
}
