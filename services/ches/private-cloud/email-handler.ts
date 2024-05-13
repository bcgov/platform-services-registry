import { render } from '@react-email/render';
import { logger } from '@/core/logging';
import AdminCreateTemplate from '@/emails/_templates/private-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/private-cloud/AdminDeleteRequest';
import AdminEditRequestTemplate from '@/emails/_templates/private-cloud/AdminEditRequest';
import CreateRequestTemplate from '@/emails/_templates/private-cloud/CreateRequest';
import DeleteApprovalTemplate from '@/emails/_templates/private-cloud/DeleteApproval';
import DeleteRequestTemplate from '@/emails/_templates/private-cloud/DeleteRequest';
import EditRequestTemplate from '@/emails/_templates/private-cloud/EditRequest';
import ProvisionedTemplate from '@/emails/_templates/private-cloud/Provisioned';
import RequestApprovalTemplate from '@/emails/_templates/private-cloud/RequestApproval';
import RequestRejectionTemplate from '@/emails/_templates/private-cloud/RequestRejection';
import {
  PrivateCloudRequestWithProjectAndRequestedProject,
  PrivateCloudRequestWithRequestedProject,
} from '@/request-actions/private-cloud/decision-request';
import { adminPrivateEmails } from '@/services/ches/email-constant';
import { sendEmail } from '@/services/ches/helpers';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';

export const sendCreateRequestEmails = async (request: PrivateCloudRequestWithRequestedProject, userName: string) => {
  try {
    const adminEmail = render(AdminCreateTemplate({ request }), { pretty: true });
    const userEmail = render(CreateRequestTemplate({ request, userName }), { pretty: true });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminPrivateEmails,
      subject: 'New provisioning request in registry waiting for your approval',
    });

    const contacts = sendEmail({
      body: userEmail,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      subject: 'Provisioning request received',
    });

    await Promise.all([contacts, admins]);
  } catch (error) {
    logger.error('sendCreateRequestEmails:', error);
  }
};

export const sendEditRequestEmails = async (
  request: PrivateCloudRequestWithProjectAndRequestedProject,
  isAdminEmailSent: boolean,
  userName: string,
) => {
  try {
    const userEmail = render(EditRequestTemplate({ request, userName }), { pretty: true });
    let admins;
    if (isAdminEmailSent) {
      const adminEmail = render(AdminEditRequestTemplate({ request }), { pretty: true });
      admins = sendEmail({
        bodyType: 'html',
        body: adminEmail,
        to: adminPrivateEmails,
        subject: 'New edit request awaiting review',
      });
    }

    const contacts = sendEmail({
      body: userEmail,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
        request.project?.projectOwner.email,
        request.project?.primaryTechnicalLead.email,
        request.project?.secondaryTechnicalLead?.email,
      ].filter(Boolean),
      subject: 'Edit request submitted',
    });

    await Promise.all([contacts, admins]);
  } catch (error) {
    logger.error('sendEditRequestEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PrivateCloudRequestWithProjectAndRequestedProject) => {
  try {
    const email = render(RequestApprovalTemplate({ request }), { pretty: true });

    await sendEmail({
      body: email,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      subject: 'Request has been approved',
    });
  } catch (error) {
    logger.error('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (
  request: PrivateCloudRequestWithProjectAndRequestedProject,
  decisionComment?: string,
) => {
  try {
    const email = render(RequestRejectionTemplate({ request, productName: request.project!.name, decisionComment }), {
      pretty: true,
    });
    await sendEmail({
      body: email,
      to: [
        request.project!.projectOwner.email,
        request.project!.primaryTechnicalLead.email,
        request.project!.secondaryTechnicalLead?.email,
      ],
      subject: `Request for ${request.project!.name} has been rejected`,
    });
  } catch (error) {
    logger.error('sendRequestRejectionEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (request: PrivateCloudRequestWithRequestedProject, userName: string) => {
  try {
    const adminEmail = render(AdminDeleteRequestTemplate({ request }), { pretty: true });
    const userEmail = render(DeleteRequestTemplate({ request, userName }), { pretty: true });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminPrivateEmails,
      subject: 'New delete request awaiting review',
    });

    const contacts = sendEmail({
      body: userEmail,
      to: [
        request.decisionData.projectOwner.email,
        request.decisionData.primaryTechnicalLead.email,
        request.decisionData.secondaryTechnicalLead?.email,
      ],
      subject: 'Request to delete product received',
    });
    await Promise.all([contacts, admins]);
  } catch (error) {
    logger.error('sendDeleteRequestEmails:', error);
  }
};

export const sendDeleteRequestApprovalEmails = async (product: PrivateCloudRequestedProjectWithContacts) => {
  try {
    const email = render(DeleteApprovalTemplate({ product }), { pretty: true });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Delete request has been approved',
    });
  } catch (error) {
    logger.error('sendDeleteRequestApprovalEmails:', error);
  }
};

export const sendProvisionedEmails = async (product: PrivateCloudRequestedProjectWithContacts) => {
  try {
    const email = render(ProvisionedTemplate({ product }), { pretty: true });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Product has been provisioned',
    });
  } catch (error) {
    logger.error('sendProvisionedEmails:', error);
  }
};
