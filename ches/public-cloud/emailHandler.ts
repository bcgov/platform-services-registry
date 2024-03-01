import { render } from '@react-email/render';
import {
  PublicCloudRequestWithProjectAndRequestedProject,
  PublicCloudRequestWithRequestedProject,
} from '@/requestActions/public-cloud/decisionRequest';

import { adminEmails } from '@/ches/emailConstant';
import { sendEmail } from '@/ches/helpers';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/publicCloud';

import AdminCreateTemplate from '@/emails/_templates/public-cloud/AdminCreateRequest';
import AdminDeleteRequestTemplate from '@/emails/_templates/public-cloud/AdminDeleteRequest';
import CreateRequestTemplate from '@/emails/_templates/public-cloud/CreateRequest';
import DeleteApprovalTemplate from '@/emails/_templates/public-cloud/DeleteApproval';
import DeleteRequestTemplate from '@/emails/_templates/public-cloud/DeleteRequest';
import EditSummaryTemplate from '@/emails/_templates/public-cloud/EditSummary';
import ProvisionedTemplate from '@/emails/_templates/public-cloud/Provisioned';
import RequestApprovalTemplate from '@/emails/_templates/public-cloud/RequestApproval';
import RequestRejectionTemplate from '@/emails/_templates/public-cloud/RequestRejection';

export const sendCreateRequestEmails = async (request: PublicCloudRequestWithRequestedProject) => {
  try {
    const adminEmail = render(AdminCreateTemplate({ request }), { pretty: true });
    const userEmail = render(CreateRequestTemplate({ request }), { pretty: true });

    const admins = sendEmail({
      bodyType: 'html',
      body: adminEmail,
      to: adminEmails,
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
    console.log('ERROR SENDING NEW REQUEST EMAIL');
  }
};

export const sendAdminDeleteRequestEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const adminEmail = render(AdminDeleteRequestTemplate({ product }), { pretty: true });

    await sendEmail({
      body: adminEmail,
      to: adminEmails,
      subject: `${product.name} is marked for deletion`,
    });
  } catch (error) {
    console.error('ERROR SENDING NEW DELETE REQUEST EMAIL');
  }
};

export const sendEditRequestEmails = async (request: PublicCloudRequestWithProjectAndRequestedProject) => {
  try {
    const userEmail = render(EditSummaryTemplate({ request }), { pretty: true });

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
    console.error('ERROR SENDING EDIT REQUEST EMAIL');
  }
};

export const sendRequestApprovalEmails = async (request: PublicCloudRequestWithRequestedProject) => {
  try {
    const email = render(RequestApprovalTemplate({ request }), { pretty: true });

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
    console.error('ERROR SENDING REQUEST APPROVAL EMAIL');
  }
};

export const sendRequestRejectionEmails = async (
  request: PublicCloudRequestedProjectWithContacts,
  decisionComment?: string,
) => {
  console.log(request);
  try {
    const email = render(RequestRejectionTemplate({ productName: request.name, decisionComment }), {
      pretty: true,
    });
    await sendEmail({
      body: email,
      to: [request.projectOwner.email, request.primaryTechnicalLead.email, request.secondaryTechnicalLead?.email],
      subject: 'Request has been rejected',
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};

export const sendDeleteRequestEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(DeleteRequestTemplate({ product }), { pretty: true });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Request to delete product received',
    });
  } catch (error) {
    console.error('ERROR SENDING NEW DELETE REQUEST EMAIL');
  }
};

export const sendDeleteRequestApprovalEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(DeleteApprovalTemplate({ product }), { pretty: true });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: 'Delete request has been approved',
    });
  } catch (error) {
    console.error('ERROR SENDING NEW DELETE REQUEST APPROVAL EMAIL');
  }
};

export const sendProvisionedEmails = async (product: PublicCloudRequestedProjectWithContacts) => {
  try {
    const email = render(ProvisionedTemplate({ product }), { pretty: true });

    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `Product has been provisioned`,
    });
  } catch (error) {
    console.error('ERROR SENDING NEW PROVISIONED EMAIL', error);
  }
};
