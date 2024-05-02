import { render } from '@react-email/render';
import {
  PublicCloudRequestWithProjectAndRequestedProject,
  PublicCloudRequestWithRequestedProject,
} from '@/request-actions/public-cloud/decision-request';
import { adminPublicEmails } from '@/services/ches/email-constant';
import { sendEmail } from '@/services/ches/helpers';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import AdminCreateTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import CreateRequestTemplate from '@/emails/_templates/public-cloud/CreateRequest';
import DeleteApprovalTemplate from '@/emails/_templates/public-cloud/DeleteApproval';
import DeleteRequestTemplate from '@/emails/_templates/public-cloud/DeleteRequest';
import EditSummaryTemplate from '@/emails/_templates/public-cloud/EditSummary';
import ProvisionedTemplate from '@/emails/_templates/public-cloud/Provisioned';
import RequestApprovalTemplate from '@/emails/_templates/public-cloud/RequestApproval';
import RequestRejectionTemplate from '@/emails/_templates/public-cloud/RequestRejection';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import { logger } from '@/core/logging';

export const sendCreateRequestEmails = async (request: PublicCloudRequestWithRequestedProject) => {
  try {
    const adminEmail = render(AdminCreateTemplate({ request }), { pretty: false });
    const userEmail = render(CreateRequestTemplate({ request }), { pretty: false });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminPublicEmails,
      subject: `New Provisioning request in Registry waiting for your approval`,
    });

    const contacts = sendEmail({
      body: userEmail,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: 'Provisioning request received',
    });

    await Promise.all([contacts, admins]);
  } catch (error) {
    logger.log('sendCreateRequestEmails:', error);
  }
};

export const sendAdminDeleteRequestEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const adminEmail = render(AdminDeleteRequestTemplate({ product }), { pretty: false });

    await sendEmail({
      body: adminEmail,
      to: adminPublicEmails,
      subject: `${product.name} is marked for deletion`,
    });
  } catch (error) {
    logger.log('sendAdminDeleteRequestEmails:', error);
  }
};

export const sendEditRequestEmails = async (request: PublicCloudRequestWithProjectAndRequestedProject) => {
  try {
    const userEmail = render(EditSummaryTemplate({ request }), { pretty: false });

    await sendEmail({
      body: userEmail,
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
        request.project?.projectOwner.email,
        request.project?.primaryTechnicalLead.email,
        request.project?.secondaryTechnicalLead?.email,
      ].filter(Boolean),
      subject: 'Edit summary',
    });
  } catch (error) {
    logger.log('sendEditRequestEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PublicCloudRequestWithRequestedProject) => {
  try {
    const email = render(RequestApprovalTemplate({ request }), { pretty: false });

    await sendEmail({
      body: email,
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: 'Request has been approved',
    });
  } catch (error) {
    logger.log('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (
  request: PublicCloudRequestedProjectWithContacts,
  decisionComment?: string,
) => {
  try {
    const email = render(RequestRejectionTemplate({ productName: request.name, decisionComment }), {
      pretty: false,
    });
    await sendEmail({
      body: email,
      to: [request.projectOwner.email, request.primaryTechnicalLead.email, request.secondaryTechnicalLead?.email],
      subject: 'Request has been rejected',
    });
  } catch (error) {
    logger.log('sendRequestRejectionEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(DeleteRequestTemplate({ product }), { pretty: false });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Request to delete product received',
    });
  } catch (error) {
    logger.log('sendDeleteRequestEmails:', error);
  }
};

export const sendDeleteRequestApprovalEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(DeleteApprovalTemplate({ product }), { pretty: false });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Delete request has been approved',
    });
  } catch (error) {
    logger.log('sendDeleteRequestApprovalEmails:', error);
  }
};

export const sendProvisionedEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(ProvisionedTemplate({ product }), { pretty: false });
    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `Product has been provisioned`,
    });
  } catch (error) {
    logger.log('sendProvisionedEmails:', error);
  }
};

export const sendExpenseAuthorityEmail = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const expenseAuthorityEmail = render(ExpenseAuthorityTemplate({ product }), { pretty: false });
    await sendEmail({
      body: expenseAuthorityEmail,
      to: [product.expenseAuthority?.email].filter(Boolean),
      subject: `You have been added as the Expense Authority for ${product.name}`,
    });
  } catch (error) {
    logger.log('sendExpenseAuthorityEmail:', error);
  }
};
