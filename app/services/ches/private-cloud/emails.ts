import { IS_PROD } from '@/config';
import { GlobalRole, privateCloudTeamEmail } from '@/constants';
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
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

function getTeamEmails(request: PrivateCloudRequestDetail) {
  return [
    request.decisionData.projectOwner.email,
    request.decisionData.primaryTechnicalLead.email,
    request.decisionData.secondaryTechnicalLead?.email,
    request.originalData?.projectOwner.email,
    request.originalData?.primaryTechnicalLead.email,
    request.originalData?.secondaryTechnicalLead?.email,
  ];
}

export async function sendAdminCreateRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(AdminCreateRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New provisioning request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminDeleteRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(AdminDeleteRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New delete request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminEditRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(AdminEditRequestTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'New edit request awaiting review',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export async function sendAdminEditRequestQuotaAutoApproval(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(AdminEditRequestQuotaAutoApprovalTemplate({ request, requester }));
  const reviewerEmails = await findUserEmailsByAuthRole(GlobalRole.PrivateReviewer);

  return sendEmail({
    subject: 'Quota upgrade auto-approval',
    to: reviewerEmails,
    cc: [IS_PROD ? privateCloudTeamEmail : ''],
    body: content,
  });
}

export function sendTeamCreateRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(TeamCreateRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New provisioning request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestApproval(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamCreateRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been approved',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestCompletion(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamCreateRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamCreateRequestRejection(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamCreateRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your provisioning request has been rejected',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(TeamDeleteRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New delete request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestApproval(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been approved',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestCompletion(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamDeleteRequestRejection(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamDeleteRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your delete request has been rejected',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequest(request: PrivateCloudRequestDetail, requester: string) {
  const content = getContent(TeamEditRequestTemplate({ request, requester }));

  return sendEmail({
    subject: 'New edit request received',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequestApproval(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamEditRequestApprovalTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been approved',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequestCompletion(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamEditRequestCompletionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been completed',
    to: getTeamEmails(request),
    body: content,
  });
}

export function sendTeamEditRequestRejection(request: PrivateCloudRequestDetail) {
  const content = getContent(TeamEditRequestRejectionTemplate({ request }));

  return sendEmail({
    subject: 'Your edit request has been rejected',
    to: getTeamEmails(request),
    body: content,
  });
}
