import { PrivateCloudProductMemberRole } from '@prisma/client';
import { IS_PROD } from '@/config';
import { GlobalRole, privateCloudTeamEmail } from '@/constants';
import prisma from '@/core/prisma';
import AdminCreateRequestTemplate from '@/emails/_templates/private-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/private-cloud/AdminDeleteRequest';
import AdminEditRequestTemplate from '@/emails/_templates/private-cloud/AdminEditRequest';
import AdminEditRequestQuotaAutoApprovalTemplate from '@/emails/_templates/private-cloud/AdminEditRequestQuotaAutoApproval';
import TeamCreateRequestTemplate from '@/emails/_templates/private-cloud/TeamCreateRequest';
import TeamCreateRequestApprovalTemplate from '@/emails/_templates/private-cloud/TeamCreateRequestApproval';
import TeamCreateRequestCompletionTemplate from '@/emails/_templates/private-cloud/TeamCreateRequestCompletion';
import TeamCreateRequestRejectionTemplate from '@/emails/_templates/private-cloud/TeamCreateRequestRejection';
import TeamDeleteRequestTemplate from '@/emails/_templates/private-cloud/TeamDeleteRequest';
import TeamDeleteRequestApprovalTemplate from '@/emails/_templates/private-cloud/TeamDeleteRequestApproval';
import TeamDeleteRequestCompletionTemplate from '@/emails/_templates/private-cloud/TeamDeleteRequestCompletion';
import TeamDeleteRequestRejectionTemplate from '@/emails/_templates/private-cloud/TeamDeleteRequestRejection';
import TeamEditRequestTemplate from '@/emails/_templates/private-cloud/TeamEditRequest';
import TeamEditRequestApprovalTemplate from '@/emails/_templates/private-cloud/TeamEditRequestApproval';
import TeamEditRequestCompletionTemplate from '@/emails/_templates/private-cloud/TeamEditRequestCompletion';
import TeamEditRequestRejectionTemplate from '@/emails/_templates/private-cloud/TeamEditRequestRejection';
import { sendEmail, getContent } from '@/services/ches/core';
import { findUserEmailsByAuthRole } from '@/services/keycloak/app-realm';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

async function getTeamEmails(request: PrivateCloudRequestDetailDecorated) {
  const memberEmails = request.decisionData.members
    .filter((member) => member.roles.includes(PrivateCloudProductMemberRole.SUBSCRIBER))
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

export async function sendAdminCreateRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(AdminCreateRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New provisioning request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminDeleteRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(AdminDeleteRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New delete request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminEditRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(AdminEditRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New edit request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminEditRequestQuotaAutoApproval(
  request: PrivateCloudRequestDetailDecorated,
  requester: string,
) {
  const content = getContent(AdminEditRequestQuotaAutoApprovalTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'Quota upgrade auto-approval',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendTeamCreateRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(TeamCreateRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New provisioning request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestApproval(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamCreateRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been approved',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestCompletion(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamCreateRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamCreateRequestRejection(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamCreateRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been rejected',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(TeamDeleteRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New delete request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestApproval(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamDeleteRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been approved',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestCompletion(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamDeleteRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamDeleteRequestRejection(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamDeleteRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been rejected',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequest(request: PrivateCloudRequestDetailDecorated, requester: string) {
  const content = getContent(TeamEditRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New edit request received',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequestApproval(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamEditRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been approved',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequestCompletion(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamEditRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been completed',
    to: await getTeamEmails(request),
    body: content,
  });
}

export async function sendTeamEditRequestRejection(request: PrivateCloudRequestDetailDecorated) {
  const content = getContent(TeamEditRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been rejected',
    to: await getTeamEmails(request),
    body: content,
  });
}
