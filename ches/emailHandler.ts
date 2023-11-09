import { render } from '@react-email/render';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import { NewRequestTemplate } from '@/emails/templates/NewRequestTemplate';
import { RequestApprovalTemplate } from '@/emails/templates/RequestApprovalTemplate';
import { RequestRejectionTemplate } from '@/emails/templates/RequestRejectionTemplate';
import { adminEmails } from './emailConstant';
import chesService from './index';

export const sendNewRequestEmails = async (formData: PrivateCloudCreateRequestBody) => {
  const email = render(NewRequestTemplate({ formData }), { pretty: true });
  try {
    const send1 = chesService.send({
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [formData.projectOwner.email, formData.primaryTechnicalLead.email, formData.secondaryTechnicalLead?.email],
      subject: `${formData.name} provisioning request received`,
    });

    const send2 = chesService.send({
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
    await chesService.send({
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
    console.error('ERROR SENDING REQUEST APPROVAL EMAIL');
  }
};

export const sendRequestRejectionEmails = async (request: PrivateCloudRequestWithRequestedProject, message: String) => {
  const email = render(RequestRejectionTemplate({ request }), { pretty: true });
  try {
    await chesService.send({
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
    console.error('ERROR SENDING REQUEST REJECTION EMAIL');
  }
};
