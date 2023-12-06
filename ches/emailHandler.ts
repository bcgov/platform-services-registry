import { render } from '@react-email/render';
import {
  PrivateCloudRequestWithProjectAndRequestedProject,
  PrivateCloudRequestWithRequestedProject,
} from '@/requestActions/private-cloud/decisionRequest';
import { NewRequestTemplate } from '@/emails/templates/private-cloud/AdminCreateRequest';
import { RequestApprovalTemplate } from '@/emails/templates/private-cloud/RequestApproval';
import { RequestRejectionTemplate } from '@/emails/templates/private-cloud/RequestRejection';
import { adminEmails } from '@/ches/emailConstant';
import { sendEmail } from '@/ches';
import EditRequestTemplate from '@/emails/templates/private-cloud/EditRequest';
import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';
import DeleteRequestTemplate from '@/emails/templates/private-cloud/DeleteRequest';
import DeleteApprovalTemplate from '@/emails/templates/private-cloud/DeleteApproval';

export const sendNewRequestEmails = async (request: PrivateCloudRequestWithRequestedProject) => {
  const email = render(NewRequestTemplate({ request }), { pretty: true });
  try {
    const contacts = sendEmail({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: `${request.requestedProject.name} provisioning request received`,
    });

    const admins = sendEmail({
      bodyType: 'html',
      body: email,
      to: adminEmails,
      subject: `New Provisioning request in Registry waiting for your approval`,
    });

    await Promise.all([contacts, admins]);
  } catch (error) {
    console.log('ERROR SENDING NEW REQUEST EMAIL EMAIL');
  }
};

export const sendRequestApprovalEmails = async (request: PrivateCloudRequestWithRequestedProject) => {
  const email = render(RequestApprovalTemplate({ request }), { pretty: true });

  try {
    await sendEmail({
      body: email,
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST APPROVAL EMAIL');
  }
};

export const sendRejectionEmails = async (request: PrivateCloudRequestWithRequestedProject, comment: string) => {
  const email = render(RequestRejectionTemplate({ productName: request.requestedProject.name, comment }), {
    pretty: true,
  });

  try {
    await sendEmail({
      body: email,
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};

export const sendEditRequestEmails = async (
  request: PrivateCloudRequestWithProjectAndRequestedProject,
  comment: string,
) => {
  const email = render(EditRequestTemplate({ request, comment }), { pretty: true });
  try {
    await sendEmail({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING EDIT REQUEST EMAIL');
  }
};

export const sendDeleteRequestEmails = async (product: PrivateCloudRequestedProjectWithContacts, comment: string) => {
  const email = render(DeleteRequestTemplate({ product }), { pretty: true });

  try {
    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `${product.name} deletion request has been rejected`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};

export const sendDeleteRequestApprovalEmails = async (product: PrivateCloudRequestedProjectWithContacts) => {
  const email = render(DeleteApprovalTemplate({ product }), { pretty: true });

  try {
    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `${product.name} deletion request has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};

export const sendDeleteRejectionEmails = async (product: PrivateCloudRequestedProjectWithContacts, comment: string) => {
  const email = render(RequestRejectionTemplate({ productName: product.name, comment }), { pretty: true });

  try {
    await sendEmail({
      body: email,
      to: [product.projectOwner.email, product.primaryTechnicalLead.email, product.secondaryTechnicalLead?.email],
      subject: `${product.name} deletion request has been rejected`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};
