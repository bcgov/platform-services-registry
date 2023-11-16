import { render } from '@react-email/render';
import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import { NewRequestTemplate } from '@/emails/templates/NewRequestTemplate';
import { RequestApprovalTemplate } from '@/emails/templates/RequestApprovalTemplate';
import { RequestRejectionTemplate } from '@/emails/templates/RequestRejectionTemplate';
import { adminEmails } from './emailConstant';
import { sendEmail } from './index';

export const sendNewRequestEmails = async (request: PrivateCloudRequestWithRequestedProject) => {
  const email = render(NewRequestTemplate({ request }), { pretty: true });
  try {
    const send1 = await sendEmail({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      subject: `${request.requestedProject.name} provisioning request received`,
    });

    const send2 = await sendEmail({
      bodyType: 'html',
      body: email,
      to: adminEmails,
      subject: `New Provisioning request in Registry waiting for your approval`,
    });

    await Promise.all([send1, send2]);
  } catch (error) {
    console.log('ERROR SENDING NEW REQUEST EMAIL EMAIL');
  }
};

export const sendRequestApprovalEmails = async (request: PrivateCloudRequestWithRequestedProject) => {
  const email = render(RequestApprovalTemplate({ request }), { pretty: true });
  try {
    await sendEmail({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ].filter(Boolean),
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST APPROVAL EMAIL');
  }
};

export const sendRequestRejectionEmails = async (request: PrivateCloudRequestWithRequestedProject, message: String) => {
  const email = render(RequestRejectionTemplate({ request }), { pretty: true });
  try {
    await sendEmail({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ].filter(Boolean),
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};
