import { DecisionStatus, RequestType } from '@prisma/client';
import { render } from '@react-email/render';
import { logger } from '@/core/logging';
import AdminCreateRequestTemplate from '@/emails/_templates/private-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/private-cloud/AdminDeleteRequest';
import AdminEditRequestTemplate from '@/emails/_templates/private-cloud/AdminEditRequest';
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
import { adminPrivateEmails } from '@/services/ches/constant';
import { sendEmail } from '@/services/ches/core';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';

export const sendCreateRequestEmails = async (request: PrivateCloudRequestDetail, requester: string) => {
  try {
    const adminContent = render(AdminCreateRequestTemplate({ request, requester }), { pretty: false });
    const teamContent = render(TeamCreateRequestTemplate({ request, requester }), { pretty: false });

    const admin = sendEmail({
      subject: 'New provisioning request in registry waiting for your approval',
      to: adminPrivateEmails,
      body: adminContent,
    });

    const team = sendEmail({
      subject: 'Provisioning request received',
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      body: teamContent,
    });

    await Promise.all([team, admin]);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
};

export const sendEditRequestEmails = async (request: PrivateCloudRequestDetail, requester: string) => {
  try {
    const teamContent = render(TeamEditRequestTemplate({ request, requester }), { pretty: false });

    let admin;
    if (request.decisionStatus === DecisionStatus.PENDING) {
      const adminContent = render(AdminEditRequestTemplate({ request, requester }), { pretty: false });
      admin = sendEmail({
        subject: 'New edit request awaiting review',
        to: adminPrivateEmails,
        body: adminContent,
      });
    }

    const team = sendEmail({
      subject: 'Edit request submitted',
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
        request.project?.projectOwner.email,
        request.project?.primaryTechnicalLead.email,
        request.project?.secondaryTechnicalLead?.email,
      ],
      body: teamContent,
    });

    await Promise.all([team, admin]);
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (request: PrivateCloudRequestDetail, requester: string) => {
  try {
    const adminContent = render(AdminDeleteRequestTemplate({ request, requester }), { pretty: false });
    const teamContent = render(TeamDeleteRequestTemplate({ request, requester }), { pretty: false });

    const admin = sendEmail({
      subject: 'New delete request awaiting review',
      to: adminPrivateEmails,
      body: adminContent,
    });

    const team = sendEmail({
      subject: 'Request to delete product received',
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      body: teamContent,
    });
    await Promise.all([team, admin]);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PrivateCloudRequestDetail) => {
  try {
    let subject = '';
    let content = '';
    if (request.type == RequestType.CREATE) {
      content = render(TeamCreateRequestApprovalTemplate({ request }), { pretty: false });
      subject = 'Product has been provisioned';
    } else if (request.type == RequestType.EDIT) {
      content = render(TeamEditRequestApprovalTemplate({ request }), { pretty: false });
      subject = 'Product edit request has been completed';
    } else if (request.type == RequestType.DELETE) {
      content = render(TeamDeleteRequestApprovalTemplate({ request }), { pretty: false });
      subject = 'Product delete request has been completed';
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
    logger.error('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (request: PrivateCloudRequestDetail) => {
  try {
    let subject = '';
    let content = '';
    if (request.type == RequestType.CREATE) {
      content = render(TeamCreateRequestRejectionTemplate({ request }), { pretty: false });
      subject = 'New product request has been rejected';
    } else if (request.type == RequestType.EDIT) {
      content = render(TeamEditRequestRejectionTemplate({ request }), { pretty: false });
      subject = 'Product edit request has been rejected';
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

export const sendRequestCompletionEmails = async (request: PrivateCloudRequestDetail) => {
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
