import { render } from '@react-email/render';
import { logger } from '@/core/logging';
import AdminCreateTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import CreateRequestTemplate from '@/emails/_templates/public-cloud/CreateRequest';
import DeleteApprovalTemplate from '@/emails/_templates/public-cloud/DeleteApproval';
import DeleteRequestTemplate from '@/emails/_templates/public-cloud/DeleteRequest';
import EditSummaryTemplate from '@/emails/_templates/public-cloud/EditSummary';
import ExpenseAuthorityTemplate from '@/emails/_templates/public-cloud/ExpenseAuthority';
import ProvisionedTemplate from '@/emails/_templates/public-cloud/Provisioned';
import RequestApprovalTemplate from '@/emails/_templates/public-cloud/RequestApproval';
import RequestRejectionTemplate from '@/emails/_templates/public-cloud/RequestRejection';
import {
  PublicCloudRequestWithProjectAndRequestedProject,
  PublicCloudRequestWithRequestedProject,
} from '@/request-actions/public-cloud/decision-request';
import { adminPublicEmails } from '@/services/ches/email-constant';
import { sendEmail } from '@/services/ches/helpers';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';

export const sendCreateRequestEmails = async (request: PublicCloudRequestWithRequestedProject, userName: string) => {
  try {
    const adminEmail = render(AdminCreateTemplate({ request, userName }), { pretty: false });
    const userEmail = render(CreateRequestTemplate({ request, userName }), { pretty: false });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminPublicEmails,
      subject: `New Provisioning request for ${request.decisionData.name} in Registry waiting for your approval`,
    });

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

    await Promise.all([contacts, admins]);
  } catch (error) {
    logger.log('sendCreateRequestEmails:', error);
  }
};

export const sendAdminDeleteRequestEmails = async (
  product: PublicCloudRequestedProjectWithContacts,
  userName: string,
) => {
  try {
    const adminEmail = render(AdminDeleteRequestTemplate({ product, userName }), { pretty: false });

    await sendEmail({
      body: adminEmail,
      to: adminPublicEmails,
      subject: `${product.name} is marked for deletion`,
    });
  } catch (error) {
    logger.log('sendAdminDeleteRequestEmails:', error);
  }
};

export const sendEditRequestEmails = async (
  request: PublicCloudRequestWithProjectAndRequestedProject,
  userName: string,
) => {
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
    logger.log('sendEditRequestEmails:', error);
  }
};

export const sendRequestApprovalEmails = async (request: PublicCloudRequestWithRequestedProject) => {
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
    logger.log('sendRequestApprovalEmails:', error);
  }
};

export const sendRequestRejectionEmails = async (
  request: PublicCloudRequestedProjectWithContacts,
  decisionComment?: string,
) => {
  try {
    const email = render(RequestRejectionTemplate({ productName: request.name, decisionComment, product: request }), {
      pretty: false,
    });
    await sendEmail({
      body: email,
      to: [request.projectOwner.email, request.primaryTechnicalLead.email, request.secondaryTechnicalLead?.email],
      subject: `Request has been rejected for ${request.name}`,
    });
  } catch (error) {
    logger.log('sendRequestRejectionEmails:', error);
  }
};

export const sendDeleteRequestEmails = async (product: PublicCloudRequestedProjectWithContacts, userName: string) => {
  try {
    const email = render(DeleteRequestTemplate({ product, userName }), { pretty: false });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `Request to delete ${product.name} product received`,
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
      subject: `Delete request for ${product.name} has been acknowledged`,
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
      subject: `Product ${product.name} has been provisioned`,
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
