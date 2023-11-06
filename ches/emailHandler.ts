import { NewRequest } from '@/emails/NewRequest';
import { adminEmails } from './emailConstant';
import chesService from './index';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import { render } from '@react-email/render';
import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import RequestApproval from '@/emails/RequestApproval';
import RequestRejection from '@/emails/RequestRejection';

export const sendNewRequestEmails = async (formData: PrivateCloudCreateRequestBody) => {
  const email = render(NewRequest({ formData }), { pretty: true });
  try {
    await chesService.send({
      bodyType: 'html',
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [formData.projectOwner.email, formData.primaryTechnicalLead.email, formData.secondaryTechnicalLead?.email],
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `${formData.name} provisioning request received`,
    });
    await chesService.send({
      bodyType: 'html',
      body: email,
      to: adminEmails,
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `New Provisioning request in Registry waiting for your approval`,
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendRequestApprovalEmails = async (request: PrivateCloudRequestWithRequestedProject) => {
  const email = render(RequestApproval({ request }), { pretty: true });
  try {
    await chesService.send({
      bodyType: 'html',
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendRequestRejectionEmails = async (request: PrivateCloudRequestWithRequestedProject, message: String) => {
  const email = render(RequestRejection({ request }), { pretty: true });
  try {
    await chesService.send({
      bodyType: 'html',
      body: email,
      // For all project contacts. Sent when the project set deletion request is successfully submitted
      to: [
        request.requestedProject.projectOwner.email,
        request.requestedProject.primaryTechnicalLead.email,
        request.requestedProject.secondaryTechnicalLead?.email,
      ],
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
      subject: `${request.requestedProject.name} has been approved`,
    });
  } catch (error) {
    console.error(error);
  }
};
